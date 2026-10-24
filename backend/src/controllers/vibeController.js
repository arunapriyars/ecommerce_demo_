const db = require('../config/db');

function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : [],
    images: p.images ? JSON.parse(p.images) : [p.image],
    why_like: p.why_like ? JSON.parse(p.why_like) : [],
    is_featured: Boolean(p.is_featured)
  };
}

exports.getVibes = (req, res) => {
  try {
    const vibes = db.query(`
      SELECT v.*, COUNT(p.id) as product_count
      FROM vibes v
      LEFT JOIN products p ON v.id = p.vibe_id
      GROUP BY v.id
      ORDER BY v.id ASC
    `);

    res.json({ vibes });
  } catch (err) {
    console.error('Get vibes error:', err);
    res.status(500).json({ message: 'Error fetching vibes.' });
  }
};

exports.recommendProducts = (req, res) => {
  try {
    const { activity, aesthetic, energy, priority } = req.body;

    // Weight score tracking across all 6 vibes
    const scores = {
      'main-character': 0,
      'study-mode': 0,
      'gym-beast': 0,
      'gamer-mode': 0,
      'chill-mode': 0,
      'creative-mode': 0
    };

    // Question 1: Activity
    if (activity) {
      const act = activity.toLowerCase();
      if (act.includes('study') || act.includes('work')) scores['study-mode'] += 5;
      else if (act.includes('gym') || act.includes('out') || act.includes('lift')) scores['gym-beast'] += 5;
      else if (act.includes('game') || act.includes('gaming')) scores['gamer-mode'] += 5;
      else if (act.includes('relax') || act.includes('chill')) scores['chill-mode'] += 5;
      else if (act.includes('creat') || act.includes('art') || act.includes('draw')) scores['creative-mode'] += 5;
      else if (act.includes('party') || act.includes('going out')) scores['main-character'] += 5;
    }

    // Question 2: Aesthetic
    if (aesthetic) {
      const aes = aesthetic.toLowerCase();
      if (aes.includes('minimal')) {
        scores['study-mode'] += 3;
        scores['chill-mode'] += 2;
      } else if (aes.includes('street')) {
        scores['main-character'] += 4;
      } else if (aes.includes('cozy')) {
        scores['chill-mode'] += 4;
      } else if (aes.includes('sporty')) {
        scores['gym-beast'] += 4;
      } else if (aes.includes('tech')) {
        scores['gamer-mode'] += 3;
        scores['study-mode'] += 2;
      } else if (aes.includes('color') || aes.includes('vibrant')) {
        scores['creative-mode'] += 4;
      }
    }

    // Question 3: Energy
    if (energy) {
      const eng = energy.toLowerCase();
      if (eng.includes('chill') || eng.includes('calm')) {
        scores['chill-mode'] += 4;
      } else if (eng.includes('balanced') || eng.includes('focus')) {
        scores['study-mode'] += 4;
      } else if (eng.includes('energetic') || eng.includes('high')) {
        scores['gym-beast'] += 3;
        scores['main-character'] += 2;
      } else if (eng.includes('chaotic') || eng.includes('wild')) {
        scores['gamer-mode'] += 4;
        scores['main-character'] += 2;
      }
    }

    // Question 4: Priority
    if (priority) {
      const pri = priority.toLowerCase();
      if (pri.includes('style') || pri.includes('look')) {
        scores['main-character'] += 4;
      } else if (pri.includes('comfort')) {
        scores['chill-mode'] += 4;
      } else if (pri.includes('productivity')) {
        scores['study-mode'] += 4;
      } else if (pri.includes('performance')) {
        scores['gym-beast'] += 3;
        scores['gamer-mode'] += 3;
      } else if (pri.includes('fun') || pri.includes('express')) {
        scores['creative-mode'] += 3;
        scores['gamer-mode'] += 2;
      }
    }

    // Determine highest score vibe
    let dominantSlug = 'chill-mode';
    let maxScore = -1;
    for (const [slug, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantSlug = slug;
      }
    }

    const dominantVibe = db.get('SELECT * FROM vibes WHERE slug = ?', [dominantSlug]);

    // Fetch recommended products matching dominant vibe, ordered by rating
    const recommendedQuery = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             v.name as vibe_name, v.slug as vibe_slug, v.icon as vibe_icon, v.color_gradient as vibe_gradient
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vibes v ON p.vibe_id = v.id
      WHERE v.slug = ?
      ORDER BY p.is_featured DESC, p.rating DESC
      LIMIT 8
    `;
    const products = db.query(recommendedQuery, [dominantSlug]).map(formatProduct);

    // Also get secondary vibe recommendations
    const sortedSlugs = Object.entries(scores)
      .filter(([s]) => s !== dominantSlug)
      .sort((a, b) => b[1] - a[1]);
    const secondarySlug = sortedSlugs[0]?.[0];
    const secondaryVibe = secondarySlug ? db.get('SELECT * FROM vibes WHERE slug = ?', [secondarySlug]) : null;

    res.json({
      message: 'Your vibe has been decoded.',
      result: `Your vibe is: ${dominantVibe.name.toUpperCase()} ${dominantVibe.icon}`,
      dominantVibe,
      secondaryVibe,
      scoreBreakdown: scores,
      products
    });
  } catch (err) {
    console.error('Recommend products error:', err);
    res.status(500).json({ message: 'Error calculating recommendations.' });
  }
};
