"""
Optimized Movie Recommendation System
Ready for production integration with your movie API
"""

import numpy as np
import pandas as pd
import difflib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from datetime import datetime


class MovieRecommendationSystem:
    def __init__(self, dataset_path=None, use_large_dataset=True):
        """
        Initialize the recommendation system

        Args:
                dataset_path: Path to CSV file (optional)
                use_large_dataset: If True, use tmbd.csv (1.3M movies), else use movies.csv (4.8K movies)
        """
        self.use_large_dataset = use_large_dataset
        self.dataset_path = dataset_path or self._get_default_dataset_path()
        self.movies_data = None  # training dataset (may be a sample)
        self.full_movies_data = None  # full dataset for matching
        self.vectorizer = None
        self.feature_matrix = None  # sparse TF-IDF matrix
        self.is_trained = False

        print(f"🎬 Initializing Movie Recommendation System...")
        print(f"📊 Dataset: {self.dataset_path}")

    def _get_default_dataset_path(self):
        """Get the default dataset path based on preference"""
        # Use backend/data as the data directory
        base_path = os.path.abspath(os.path.join(
            os.path.dirname(__file__), '..', 'data'))
        if self.use_large_dataset and os.path.exists(os.path.join(base_path, "tmbd.csv")):
            return os.path.join(base_path, "tmbd.csv")
        else:
            return os.path.join(base_path, "movies.csv")

    def load_data(self, limit=None):
        """
        Load and preprocess the movie data
        
        Args:
            limit: Maximum number of rows to load (dataset subset)
        """
        print("📥 Loading movie data...")
        if limit:
            print(f"⚠️ Limit set to {limit} rows")

        try:
            # Load the dataset with optional limit
            if limit:
                self.movies_data = pd.read_csv(self.dataset_path, nrows=limit)
            else:
                self.movies_data = pd.read_csv(self.dataset_path)
            
            print(f"✅ Loaded {len(self.movies_data):,} movies")
            
            # Verify we didn't just load the LFS pointer
            if len(self.movies_data) < 10:
                print("⚠️ Warning: Dataset seems suspiciously small. Checking content...")
                print(self.movies_data.head())

            # Clean and prepare data based on dataset type
            if self.use_large_dataset and 'tmbd.csv' in self.dataset_path:
                self._prepare_tmbd_data()
            else:
                self._prepare_original_data()

            print(f"🔧 Data preprocessing completed")
            # Keep a full copy for robust title matching
            self.full_movies_data = self.movies_data.copy()
            return True

        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return False

    def _prepare_tmbd_data(self):
        """Prepare TMDB dataset (1.3M movies)"""
        # Select relevant columns and rename for consistency
        required_columns = [
            'id', 'title', 'genres', 'keywords', 'tagline', 'overview',
            'original_language', 'spoken_languages', 'production_countries'
        ]

        # Check which columns exist
        available_columns = [
            col for col in required_columns if col in self.movies_data.columns]

        # Create a simplified dataset with available features
        self.movies_data = self.movies_data[available_columns].copy()

        # Fill missing values
        for col in self.movies_data.columns:
            if col != 'id':
                self.movies_data[col] = self.movies_data[col].fillna('')

        # Create a simple index
        self.movies_data['index'] = range(len(self.movies_data))

        # For TMDB, use genres, keywords, tagline, overview, language, spoken, country
        self.feature_columns = [
            'genres', 'keywords', 'tagline', 'overview',
            'original_language', 'spoken_languages', 'production_countries'
        ]
        self.feature_columns = [
            col for col in self.feature_columns if col in self.movies_data.columns]

        print(f"🎯 Using features: {self.feature_columns}")

    def _prepare_original_data(self):
        """Prepare original dataset (4.8K movies)"""
        # Use the original approach, but add language/country if present
        self.feature_columns = [
            'genres', 'keywords', 'tagline', 'cast', 'director',
            'original_language', 'spoken_languages', 'production_countries'
        ]
        self.feature_columns = [
            col for col in self.feature_columns if col in self.movies_data.columns]

        # Fill missing values
        for feature in self.feature_columns:
            self.movies_data[feature] = self.movies_data[feature].fillna('')

    def train_model(self, sample_size=None):
        """
        Train the recommendation model

        Args:
                sample_size: If specified, use only a sample of movies for faster training
        """
        if self.movies_data is None:
            print("❌ Please load data first")
            return False

        print("🤖 Training recommendation model...")

        try:
            # Sample data if specified (useful for large datasets)
            if sample_size and len(self.movies_data) > sample_size:
                print(
                    f"📊 Sampling {sample_size:,} movies for faster training...")
                if 'popularity' in self.movies_data.columns:
                    # Prefer most popular titles to keep well-known movies like 'Avatar'
                    sampled = self.movies_data.copy()
                    # Ensure numeric popularity
                    sampled['popularity_num'] = pd.to_numeric(
                        sampled['popularity'], errors='coerce').fillna(0)
                    sampled = sampled.sort_values(
                        'popularity_num', ascending=False).head(sample_size)
                    sampled = sampled.drop(columns=['popularity_num'])
                else:
                    sampled = self.movies_data.sample(
                        n=sample_size, random_state=42)

                self.movies_data = sampled.reset_index(drop=True)
                self.movies_data['index'] = range(len(self.movies_data))

            # Combine features with optimized weighting
            print("🎯 Creating optimized weighted features...")

            # Create weighted features using vectorized operations (no Python loops)
            # High weight: genres (4x) + keywords (2x) + overview + language
            def _safe_fill(col):
                if col in self.movies_data:
                    return self.movies_data[col].fillna('').astype(str)
                return pd.Series([''] * len(self.movies_data))

            genres_s = _safe_fill('genres')
            # Replace commas with spaces for TF-IDF to handle tokens like "Science Fiction" as simplified tokens or n-grams if configured
            # But better to keep them as text. "Science Fiction" -> "Science", "Fiction" works for similarity.
            # We just explicitly weight it higher.
            
            keywords_s = _safe_fill('keywords')
            overview_s = _safe_fill('overview')
            lang_s = _safe_fill('original_language')

            # build combined series efficiently - Increase genre weight to 4x
            combined_features = (
                genres_s + ' ' + genres_s + ' ' + genres_s + ' ' + genres_s + ' ' +
                keywords_s + ' ' + keywords_s + ' ' +
                overview_s + ' ' + lang_s
            )

            # Vectorize features with optimized parameters
            print("⚡ Creating optimized TF-IDF vectors...")
            self.vectorizer = TfidfVectorizer(
                max_features=5000,        # Increased from 2000 for better nuance
                stop_words='english',
                ngram_range=(1, 2),       # Use bigrams to capture "Science Fiction" as a unit
                min_df=2,                 # Lower threshold
                max_df=0.9,
                dtype=np.float32,
                norm='l2'
            )

            # Build sparse TF-IDF matrix
            self.feature_matrix = self.vectorizer.fit_transform(
                combined_features)
            print(f"📐 Feature matrix shape: {self.feature_matrix.shape}")

            self.is_trained = True
            print("✅ Model training completed!")
            return True

        except Exception as e:
            print(f"❌ Error training model: {e}")
            return False

    def get_recommendations(self, movie_name, num_recommendations=10):
        """
        Get movie recommendations
        
        Args:
                movie_name: Name of the movie
                num_recommendations: Number of recommendations to return

        Returns:
                List of recommended movie titles
        """
        if not self.is_trained:
            print("❌ Model not trained. Please train the model first.")
            return []

        try:
            # Match against full dataset titles for robustness
            source_df = self.full_movies_data if self.full_movies_data is not None else self.movies_data
            list_of_all_titles = source_df['title'].tolist()

            # Find close match
            # First try a fuzzy match with a lower cutoff to be tolerant
            find_close_match = difflib.get_close_matches(
                movie_name, list_of_all_titles, n=1, cutoff=0.3)

            # If no fuzzy match, try a simple substring search as a fallback
            if not find_close_match:
                lowered = movie_name.lower()
                contains_matches = [
                    t for t in list_of_all_titles if lowered in t.lower()]
                if contains_matches:
                    find_close_match = [contains_matches[0]]

            if not find_close_match:
                print(f"❌ No close match found for '{movie_name}'")
                return []

            matched_title = find_close_match[0]

            # Build feature string for the matched title from the full dataset row
            row = source_df[source_df.title == matched_title]
            if row.empty:
                print(f"❌ Matched title not found in data: '{matched_title}'")
                return []

            def _build_features(r):
                # Match the exact approach used in training (optimized weighting)
                # High weight: genres (4x) + keywords (2x) + overview + language
                genres = r.get('genres', '') if isinstance(r, dict) else r.get('genres', '')
                keywords = r.get('keywords', '') if isinstance(r, dict) else r.get('keywords', '')
                overview = r.get('overview', '') if isinstance(r, dict) else r.get('overview', '')
                language = r.get('original_language', '') if isinstance(r, dict) else r.get('original_language', '')

                # Handle NaN values
                if pd.isna(genres): genres = ''
                if pd.isna(keywords): keywords = ''
                if pd.isna(overview): overview = ''
                if pd.isna(language): language = ''

                # Apply same weighting as in training
                return f"{genres} {genres} {genres} {genres} {keywords} {keywords} {overview} {language}"

            combined = _build_features(row.iloc[0])
            input_vec = self.vectorizer.transform([combined])

            # Compute similarity scores efficiently
            try:
                sim_row = (self.feature_matrix @ input_vec.T).toarray().ravel()
            except Exception:
                sim_row = cosine_similarity(input_vec, self.feature_matrix).ravel()

            # Use argpartition to get top candidates
            num_candidates = max(num_recommendations * 3, num_recommendations + 10)
            if num_candidates < len(sim_row):
                top_idx = np.argpartition(sim_row, -num_candidates)[-num_candidates:]
                top_scores = sim_row[top_idx]
                order = np.argsort(top_scores)[::-1]
                sorted_indices = top_idx[order]
            else:
                sorted_indices = np.argsort(sim_row)[::-1]

            # Get recommendations with enhanced scoring
            recommendations = []
            seen_titles = set()

            # Get source movie details for genre-based enhancement
            source_row = row.iloc[0]
            # Improved genre parsing: handle comma separation
            source_genres_str = str(source_row.get('genres', ''))
            source_genres = set(g.strip() for g in source_genres_str.replace(',', ' ').split() if g.strip()) # Split by space is safer if commas are inconsistent, but comma split is precise
            # Actually, screenshot shows "Action, Science Fiction". Comma separated.
            # But the dataset might be mixed. Let's try to split by comma first.
            if ',' in source_genres_str:
                source_genres = set(g.strip() for g in source_genres_str.split(',') if g.strip())
            else:
                source_genres = set(g.strip() for g in source_genres_str.split() if g.strip())

            # Build top candidate list (index, score) from sorted indices
            top_candidates = []
            for idx in sorted_indices:
                top_candidates.append((int(idx), float(sim_row[int(idx)])))

            for index, similarity_score_val in top_candidates:
                candidate_row = self.movies_data.iloc[index]
                title = candidate_row['title']

                # Skip if same title as matched source or already seen
                if title == matched_title or title in seen_titles:
                    continue

                # Apply genre overlap boost
                cand_genres_str = str(candidate_row.get('genres', ''))
                if ',' in cand_genres_str:
                    candidate_genres = set(g.strip() for g in cand_genres_str.split(',') if g.strip())
                else:
                    candidate_genres = set(g.strip() for g in cand_genres_str.split() if g.strip())
                
                genre_overlap = len(source_genres.intersection(candidate_genres))

                # Boost score if there's good genre overlap
                # Higher boost for "Same Genre" preference
                if genre_overlap > 0:
                    similarity_score_val += genre_overlap * 0.15

                recommendations.append({
                    'title': title,
                    'similarity_score': float(similarity_score_val),
                    'rank': len(recommendations) + 1,
                    'genre_overlap': genre_overlap
                })

                seen_titles.add(title)

                if len(recommendations) >= num_recommendations:
                    break

            # Sort by enhanced similarity score
            recommendations.sort(
                key=lambda x: x['similarity_score'], reverse=True)

            # Update ranks after sorting
            for i, rec in enumerate(recommendations):
                rec['rank'] = i + 1

            return recommendations

        except Exception as e:
            print(f"❌ Error getting recommendations: {e}")
            return []

    def save_model(self, filepath="movie_recommendation_model.pkl"):
        """Save the trained model"""
        if not self.is_trained:
            print("❌ No trained model to save")
            return False

        try:
            model_data = {
                'movies_data': self.movies_data,
                # Store feature matrix and vectorizer to avoid recomputing TF-IDF
                'feature_matrix': self.feature_matrix,
                'vectorizer': self.vectorizer,
                'feature_columns': self.feature_columns,
                'trained_at': datetime.now()
            }

            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)

            print(f"💾 Model saved to {filepath}")
            return True

        except Exception as e:
            print(f"❌ Error saving model: {e}")
            return False

    def load_model(self, filepath="movie_recommendation_model.pkl"):
        """Load a pre-trained model"""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)

            self.movies_data = model_data['movies_data']
            self.feature_matrix = model_data.get('feature_matrix')
            self.vectorizer = model_data['vectorizer']
            self.feature_columns = model_data['feature_columns']
            self.is_trained = True

            print(f"📂 Model loaded from {filepath}")
            print(f"🎬 Loaded {len(self.movies_data):,} movies")
            return True

        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False

# Quick setup function for your API integration


def setup_recommendation_system(use_large_dataset=True, sample_size=50000, load_limit=None):
    """
    Quick setup function for production use
    
    Args:
            use_large_dataset: Use large TMDB dataset (True) or small dataset (False)
            sample_size: Sample size for training (None for full dataset)
            load_limit: Limit rows loaded from CSV (None for full file)
    """
    print("🚀 Setting up Movie Recommendation System for Production...")

    # Initialize system
    system = MovieRecommendationSystem(use_large_dataset=use_large_dataset)

    # Load data
    if not system.load_data(limit=load_limit):
        return None

    # Train model
    if not system.train_model(sample_size=sample_size):
        return None

    print("✅ System ready for production!")
    return system


# Example usage
if __name__ == "__main__":
    # Quick test with small sample for demo
    print("🧪 Testing with small sample...")
    # Use load_limit to avoid reading the whole file if debugging
    system = setup_recommendation_system(
        use_large_dataset=True, load_limit=20000, sample_size=10000)

    if system:
        # Test recommendations
        recommendations = system.get_recommendations(
            "Avatar", num_recommendations=5)

        print(f"\n🎯 Recommendations for 'Avatar':")
        for rec in recommendations:
            print(
                f"{rec['rank']}. {rec['title']} (similarity: {rec['similarity_score']:.3f})")

        # Save model for production use
        system.save_model("production_model.pkl")
