document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn');
  const status = document.getElementById('status');
  const error = document.getElementById('error');

  async function captureRecipe() {
    try {
      captureBtn.disabled = true;
      status.textContent = 'Capturing recipe...';
      error.textContent = '';

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'captureRecipe' });
      
      if (result.success) {
        // Send to WendellAI backend
        const response = await fetch('http://localhost:5000/api/recipes/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result.recipe)
        });

        if (!response.ok) {
          throw new Error('Failed to save recipe');
        }

        status.textContent = 'Recipe captured successfully!';
      } else {
        throw new Error(result.error || 'Failed to capture recipe');
      }
    } catch (err) {
      error.textContent = err.message;
      status.textContent = '';
    } finally {
      captureBtn.disabled = false;
    }
  }

  captureBtn.addEventListener('click', captureRecipe);
});
