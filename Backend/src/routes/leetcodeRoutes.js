const express = require('express');
const router = express.Router();

// GraphQL Query to get both generic stats and tag-specific stats
const LEETCODE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
  }
`;

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // We must send headers to mimic a browser, or LeetCode might block the request
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username }
      })
    });

    const data = await response.json();

    if (data.errors || !data.data?.matchedUser) {
      return res.status(404).json({ error: "User not found or API error" });
    }

    const userData = data.data.matchedUser;
    const stats = userData.submitStats?.acSubmissionNum || [];

    // Helper to extract count safely
    const getCount = (diff) => {
      const found = stats.find(s => s.difficulty === diff);
      return found ? found.count : 0;
    };

    // Flatten topic tags from all categories
    const allTopics = [
      ...(userData.tagProblemCounts?.fundamental || []),
      ...(userData.tagProblemCounts?.intermediate || []),
      ...(userData.tagProblemCounts?.advanced || [])
    ].map(t => ({
      topicName: t.tagName,
      solved: t.problemsSolved
    })).sort((a, b) => b.solved - a.solved); // Sort desc by solved count

    // Final JSON structure for Frontend
    res.json({
      total: getCount('All'),
      easy: getCount('Easy'),
      medium: getCount('Medium'),
      hard: getCount('Hard'),
      topics: allTopics
    });

  } catch (err) {
    console.error("LeetCode API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;