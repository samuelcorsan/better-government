document.querySelector('#run').addEventListener('click', async () => {
  const parameters = new URLSearchParams(location.hash.slice(1));
  const report = await chrome.runtime.sendMessage({
    type: 'run',
    origin: parameters.get('origin'),
    mode: parameters.get('mode'),
  });
  document.querySelector('#report').textContent = JSON.stringify(report);
});
