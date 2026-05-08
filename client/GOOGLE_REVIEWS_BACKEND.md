# Google Reviews backend endpoint

Frontend is ready and calls:

```http
GET /api/google-reviews?placeId=ChIJYaPJi-S9D4gRtDreZsY3XD4
```

Keep the Google API key only on the backend.

Example Express endpoint:

```js
app.get('/api/google-reviews', async (req, res) => {
  const placeId = req.query.placeId || process.env.GOOGLE_PLACE_ID
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Google Places API key is not configured.' })
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
  const googleRes = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'id',
        'displayName',
        'rating',
        'userRatingCount',
        'googleMapsUri',
        'reviews',
      ].join(','),
    },
  })

  if (!googleRes.ok) {
    const text = await googleRes.text()
    return res.status(googleRes.status).json({ error: text })
  }

  const place = await googleRes.json()
  res.json({
    rating: place.rating || 0,
    userRatingCount: place.userRatingCount || 0,
    googleMapsUri: place.googleMapsUri,
    reviews: place.reviews || [],
  })
})
```

Required backend env:

```env
GOOGLE_PLACES_API_KEY=your_google_key
GOOGLE_PLACE_ID=ChIJYaPJi-S9D4gRtDreZsY3XD4
```

Google may return only a limited set of reviews through Places API. The frontend supports avatar, text, rating, date, and Google profile link when Google returns them.
