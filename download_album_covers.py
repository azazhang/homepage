#!/usr/bin/env python3
"""
Album Cover Downloader for JJJ_B
Downloads album covers from streaming platforms and saves them locally.
"""

import requests
import os
from urllib.parse import urlparse

def download_image(url, filename, folder="images/album-covers"):
    """Download an image from URL and save it to the specified folder."""
    try:
        # Create directory if it doesn't exist
        os.makedirs(folder, exist_ok=True)
        
        # Download the image
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Save the image
        filepath = os.path.join(folder, filename)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✅ Downloaded: {filename}")
        return filepath
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")
        return None

def main():
    """Main function to download all album covers."""
    
    # Album cover URLs - UPDATE THESE WITH YOUR ACTUAL URLS
    # You can get these from:
    # - Bandcamp: Right-click album art → "Copy image address"
    # - Spotify: Use web player, inspect element, find image URL
    # - Apple Music: Similar process in web player
    
    album_covers = {
        # Real Bandcamp album cover URLs
        "gloomy-vapor.jpg": "https://f4.bcbits.com/img/a1505501111_10.jpg",
        "fidelity-on-the-floor.jpg": "https://f4.bcbits.com/img/a3975056476_10.jpg",
        "caught-in-the-trap.jpg": "https://f4.bcbits.com/img/a3697174969_10.jpg",
        "knocking-like-a-mess.jpg": "https://f4.bcbits.com/img/a0764640091_10.jpg",
        "melted-soul.jpg": "https://f4.bcbits.com/img/a4250441003_10.jpg",
        "yes-its-album.jpg": "https://f4.bcbits.com/img/a0846388170_10.jpg",
    }
    
    print("🎵 Downloading JJJ_B Album Covers...")
    print("=" * 50)
    
    downloaded_count = 0
    total_count = len(album_covers)
    
    for filename, url in album_covers.items():
        if url == "https://example.com/your-actual-url-here":
            print(f"⚠️  Skipping {filename} - URL not set")
            continue
            
        if download_image(url, filename):
            downloaded_count += 1
    
    print("=" * 50)
    print(f"🎉 Downloaded {downloaded_count}/{total_count} album covers")
    
    if downloaded_count > 0:
        print("\n📝 Next steps:")
        print("1. Update your HTML to use the downloaded images")
        print("2. Remove the CSS placeholders")
        print("3. Test the website performance")

if __name__ == "__main__":
    main() 