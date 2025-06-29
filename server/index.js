// Add debug logging to the video API endpoint
app.get('/api/videos/:seriesSlug/:episodeNumber', async (req, res) => {
  const { seriesSlug, episodeNumber } = req.params;
  
  console.log(`🔍 API CALL: /api/videos/${seriesSlug}/${episodeNumber}`);
  console.log(`📊 Request params:`, { seriesSlug, episodeNumber });

  try {
    // First, find series by slug
    const seriesResult = await pool.query('SELECT id, title FROM series');
    const allSeries = seriesResult.rows;
    
    console.log(`📊 Checking ${allSeries.length} series for slug match`);
    
    let foundSeries = null;
    for (const series of allSeries) {
      const generatedSlug = createSeriesSlug(series.title);
      console.log(`🔗 Series "${series.title}" → slug "${generatedSlug}"`);
      
      if (generatedSlug.toLowerCase() === seriesSlug.toLowerCase()) {
        foundSeries = series;
        console.log(`✅ Found matching series: ${series.title} (ID: ${series.id})`);
        break;
      }
    }

    if (!foundSeries) {
      console.log(`❌ No series found for slug: "${seriesSlug}"`);
      console.log(`🔍 Available slugs:`, allSeries.map(s => createSeriesSlug(s.title)));
      return res.status(404).json({ 
        success: false, 
        error: `Series not found for slug: ${seriesSlug}`,
        availableSlugs: allSeries.map(s => ({ title: s.title, slug: createSeriesSlug(s.title) }))
      });
    }

    // Now find video for this series and episode
    console.log(`🎬 Looking for video: series_id=${foundSeries.id}, episode_number=${episodeNumber}`);
    const videoResult = await pool.query(
      'SELECT * FROM videos WHERE series_id = $1 AND episode_number = $2 AND status = $3',
      [foundSeries.id, parseInt(episodeNumber), 'completed']
    );

    if (videoResult.rows.length === 0) {
      console.log(`❌ No video found for series ${foundSeries.id} episode ${episodeNumber}`);
      
      // Check if video exists but not completed
      const allVideosResult = await pool.query(
        'SELECT * FROM videos WHERE series_id = $1 AND episode_number = $2',
        [foundSeries.id, parseInt(episodeNumber)]
      );
      
      if (allVideosResult.rows.length > 0) {
        const video = allVideosResult.rows[0];
        console.log(`⚠️ Video exists but status is: ${video.status}`);
        return res.status(404).json({ 
          success: false, 
          error: `Video not ready - status: ${video.status}`,
          videoStatus: video.status,
          processingProgress: video.processing_progress
        });
      }
      
      return res.status(404).json({ 
        success: false, 
        error: 'Video not found or not ready',
        seriesFound: true,
        seriesTitle: foundSeries.title
      });
    }

    const video = videoResult.rows[0];
    console.log(`✅ Found video: ${video.title} (ID: ${video.id})`);

    // Create HLS URL using series slug
    const episodeFolderName = `tap-${video.episode_number.toString().padStart(2, '0')}`;
    const hlsUrl = `/segments/${seriesSlug}/${episodeFolderName}/playlist.m3u8`;

    console.log(`🎬 Generated HLS URL: ${hlsUrl}`);

    // Verify the HLS file exists
    const hlsPath = path.join(SEGMENTS_DIR, seriesSlug, episodeFolderName, 'playlist.m3u8');
    console.log(`📁 Checking HLS file at: ${hlsPath}`);
    
    const hlsExists = await fs.pathExists(hlsPath);
    console.log(`📁 HLS file exists: ${hlsExists}`);

    if (!hlsExists) {
      console.log(`❌ HLS file not found at: ${hlsPath}`);
      return res.status(404).json({ 
        success: false, 
        error: 'HLS file not found',
        expectedPath: hlsPath,
        videoId: video.id
      });
    }

    res.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        duration: video.duration,
        hlsUrl: hlsUrl,
        status: video.status,
        totalSegments: video.total_segments
      }
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});