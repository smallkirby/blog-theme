export async function onRequest(context) {
  const { request } = context;
  const urlObj = new URL(request.url);
  const uri = urlObj.searchParams.get('uri');
  if (!uri) {
    return new Response(
      JSON.stringify({
        msg: 'uri is required',
      }),
      {
        status: 400,
      }
    );
  }

  const res = await fetch(
    `https://s.hatena.com/entry.json?uri=${encodeURIComponent(uri)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await res.json();
  const entries = data.entries;

  if (!entries || entries.length === 0) {
    return new Response(
      JSON.stringify({
        stars: [],
        msg: 'ok',
      }),
      {
        status: 200,
      }
    );
  }

  // eslint-disable-next-line camelcase
  const { stars, colored_stars } = entries[0];
  // eslint-disable-next-line camelcase
  const coloredStars = colored_stars;
  const allStars = stars.map((star) => ({
    ...star,
    color: 'normal',
  }));
  if (coloredStars) {
    for (const colorStar of coloredStars) {
      for (const star of colorStar.stars) {
        allStars.push({
          ...star,
          color: colorStar.color,
        });
      }
    }
  }

  return new Response(
    JSON.stringify({
      stars: allStars,
      msg: 'ok',
    }),
    {
      status: 200,
    }
  );
}
