function changeFeedOptimiserSubmitButton(selector) {
  const feedOtimiserSubmit = document.getElementById(selector);

  feedOtimiserSubmit.disabled = true;
  feedOtimiserSubmit.classList.add(
    'cursor-not-allowed',
    'bg-gray-300',
    'pointer-events-none',
    'shadow-none'
  );
  feedOtimiserSubmit.innerHTML = `<div role="status" class="flex justify-center items-center gap-2">
                                    <svg aria-hidden="true" class="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                                    <span class="">Optimising...</span>
                                </div>`;
}

function displayToast(text, element) {
  // Create the main toast container
  const toast = document.createElement('div');
  toast.id = 'toast-success';
  toast.className =
    'fixed top-4 right-2 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800';
  toast.setAttribute('role', 'alert');

  // Create the icon container
  const iconContainer = document.createElement('div');
  iconContainer.className =
    'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200';

  // Create the icon (SVG element)
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.className = 'w-5 h-5';
  icon.setAttribute('fill', 'currentColor');
  icon.setAttribute('viewBox', '0 0 20 20');
  icon.innerHTML = `
    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
  `;

  // Create the text element
  const textElement = document.createElement('div');
  textElement.className = 'ms-3 text-sm font-normal';
  textElement.textContent = text;

  // Create the close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className =
    'ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700';
  closeButton.setAttribute('aria-label', 'Close');

  // Create the close icon (SVG element)
  const closeIcon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  closeIcon.className = 'w-3 h-3';
  closeIcon.setAttribute('fill', 'none');
  closeIcon.setAttribute('viewBox', '0 0 14 14');
  closeIcon.innerHTML = `
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
  `;

  // Append the close icon to the button
  closeButton.appendChild(closeIcon);

  // Close toast on button click
  closeButton.onclick = () => {
    toast.remove();
  };

  // Append elements to their respective containers
  iconContainer.appendChild(icon);
  toast.appendChild(iconContainer);
  toast.appendChild(textElement);
  toast.appendChild(closeButton);

  // Insert the toast into the DOM after the specified element
  element.insertAdjacentElement('afterend', toast);

  // Auto-remove the toast after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

async function copyToClipboard(copyText, element) {
  try {
    if (copyText === null) {
      displayToast('Nothing to copy', element);
      console.error('Nothing to copy');
      return;
    }

    if (copyText.includes('/')) {
      baseUrl = window.location.origin;
      copyText = baseUrl + copyText;
    }
    await navigator.clipboard.writeText(copyText);
    displayToast('Copied to clipboard', element);
    console.log('Copied to clipboard');
  } catch (err) {
    displayToast(`Failed to copy: ${err}`, element);
    console.error('Failed to copy: ', err);
  }
}

// Variables
const feedOtimiserForm = document.getElementById('feed-optimiser-form');
const feedOptimiserImportForm = document.getElementById(
  'feed-omptimiser-import-csv-form'
);
const copyFeedUrlButton = document.getElementById('copy-link-button');

// Event Listeners
if (feedOtimiserForm !== null) {
  feedOtimiserForm.addEventListener('submit', () => {
    changeFeedOptimiserSubmitButton('feed-optimiser-submit');
  });
}

if (feedOptimiserImportForm !== null) {
  feedOptimiserImportForm.addEventListener('submit', () => {
    changeFeedOptimiserSubmitButton('feed-optimiser-import-submit');
  });
}

if (copyFeedUrlButton !== null) {
  copyFeedUrlButton.addEventListener('click', async () => {
    const feedUrl = copyFeedUrlButton.getAttribute('data-copy-text');
    await copyToClipboard(feedUrl, copyFeedUrlButton);
  });
}
