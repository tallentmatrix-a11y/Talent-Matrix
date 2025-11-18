const express = require('express');
const router = express.Router();

const LEETCODE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      languageProblemCount {
        languageName
        problemsSolved
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

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
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

    res.json({
      languages: userData.languageProblemCount || [],
      skills: {
        advanced: userData.tagProblemCounts?.advanced || [],
        intermediate: userData.tagProblemCounts?.intermediate || [],
        fundamental: userData.tagProblemCounts?.fundamental || []
      }
    });

  } catch (err) {
    console.error("LeetCode API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
