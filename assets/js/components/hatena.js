// eslint-disable-next-line no-unused-vars
const fetchHatenaStars = (uri) => {
  const colors = {
    normal: '#ffb000',
    green: '#00d300',
    red: '#ff003e',
    blue: '#00a1de',
    purple: '#b400c0',
  };

  window.addEventListener('DOMContentLoaded', () => {
    const setStars = (stars) => {
      const container = document.getElementById('hatena-stars');
      if (!container) {
        return;
      }

      for (const star of stars) {
        const starSpan = document.createElement('span');
        starSpan.classList.add('hatena-star');
        starSpan.classList.add(`hatena-star-${star.color}`);
        starSpan.innerHTML = '&#9733;';
        const color = colors[star.color] || colors['normal'];
        starSpan.style.color = color;
        container.appendChild(starSpan);
      }
    };

    fetch(`/funcs/hatenastar?uri=${encodeURIComponent(uri)}`).then(
      async (res) => {
        if (res.status !== 200) {
          console.error('Failed to fetch stars');
          return;
        }
        const data = await res.json();
        if (data.msg !== 'ok') {
          console.error('Failed to fetch stars: ' + data.msg);
          return;
        }

        const stars = data.stars;
        setStars(stars);
      }
    );
  });
};
