const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Submit new score
router.post("/scores", auth, async (req, res) => {
  try {
    const { wpm, accuracy, duration } = req.body;

    // Add score to user's scores array
    req.user.scores.push({ wpm, accuracy, duration });
    await req.user.save();

    res.status(201).json({ message: "Score recorded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get top scores for a specific duration
router.get("/top/:duration", async (req, res) => {
  try {
    const duration = parseInt(req.params.duration);
    if (![30, 60].includes(duration)) {
      return res.status(400).json({ message: "Invalid duration" });
    }

    const topScores = await User.aggregate([
      { $unwind: "$scores" },
      { $match: { "scores.duration": duration } },
      { $sort: { "scores.wpm": -1 } },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          wpm: "$scores.wpm",
          accuracy: "$scores.accuracy",
          timestamp: "$scores.timestamp",
        },
      },
    ]);

    res.json(topScores);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's personal best scores
router.get("/personal-best", auth, async (req, res) => {
  try {
    const personalBests = {
      30: null,
      60: null,
    };

    // Find best score for each duration
    for (const duration of [30, 60]) {
      const bestScore = await User.aggregate([
        { $match: { _id: req.user._id } },
        { $unwind: "$scores" },
        { $match: { "scores.duration": duration } },
        { $sort: { "scores.wpm": -1 } },
        { $limit: 1 },
        {
          $project: {
            wpm: "$scores.wpm",
            accuracy: "$scores.accuracy",
            timestamp: "$scores.timestamp",
          },
        },
      ]);

      if (bestScore.length > 0) {
        personalBests[duration] = bestScore[0];
      }
    }

    res.json(personalBests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
