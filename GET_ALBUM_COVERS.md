# How to Get Album Cover URLs

## From Bandcamp (Recommended - High Quality)

1. Go to your Bandcamp page: https://jjjb.bandcamp.com/
2. Right-click on any album cover
3. Select "Copy image address" or "Copy image URL"
4. The URL will be something like: `https://f4.bcbits.com/img/a1234567890_10.jpg`

## From Spotify Web Player

1. Go to https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc
2. Open browser developer tools (F12)
3. Find any album cover image
4. Right-click the image → "Copy image address"
5. Look for URLs like: `https://i.scdn.co/image/ab67616d00001e02...`

## From Apple Music Web

1. Go to https://music.apple.com/us/artist/jjj-b/1586552449
2. Open browser developer tools (F12)
3. Right-click album art → "Copy image address"
4. Look for URLs like: `https://is1-ssl.mzstatic.com/image/thumb/Music...`

## Image Size Recommendations

- **Minimum**: 600x600px
- **Recommended**: 1000x1000px or higher
- **Format**: JPEG or PNG
- **File size**: Under 500KB each for web performance

## After Getting URLs

1. Edit `download_album_covers.py`
2. Replace the example URLs with your actual image URLs
3. Run: `python3 download_album_covers.py`
4. Update your HTML to use the downloaded images

## Example URL Update

```python
album_covers = {
    "addicted-to-ni.jpg": "https://f4.bcbits.com/img/a1234567890_10.jpg",
    "knocking-like-a-mess.jpg": "https://f4.bcbits.com/img/a9876543210_10.jpg",
    # ... etc
}
``` 