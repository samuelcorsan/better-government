document.querySelector('#run').addEventListener('click', async () => {
  const origin = new URLSearchParams(location.hash.slice(1)).get('origin');
  const report = await chrome.runtime.sendMessage({ type: 'run', origin });
  document.querySelector('#report').textContent = JSON.stringify(report);
});
