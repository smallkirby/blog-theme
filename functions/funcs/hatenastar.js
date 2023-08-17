export default async function onRequestGet(context) {
  // Get query parameter `uri` from request URL
  const { request } = context;
  const urlObj = new URL(request.url);
  const uri = urlObj.searchParams.get('uri');
  if (!uri) {
    return new Response({
      msg: 'uri is required',
    }, {
      status: 400,
    });
  }

  // Fetch Hatena Stars API
  const res = await fetch(`https://s.hatena.com/entry.json?uri=${encodeURIComponent(uri)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  const entries = data.entries;

  if (!entries || entries.length === 0) {
    return new Response({
      stars: 0,
      msg: 'ok',
    }, {
      status: 200,
    });
  }

  const { stars, colorStars } = entries[0];
  const allStars = stars.map((star) => ({
    ...star,
    color: 'normal',
  }));
  if (colorStars) {
    for (const colorStar of colorStars) {
      for (const star of colorStar.stars) {
        allStars.push({
          ...star,
          color: colorStar.color,
        });
      }
    }
  }

  return new Response({
    stars: allStars,
    msg: 'ok',
  }, {
    status: 200,
  });
};
