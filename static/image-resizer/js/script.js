// Change the submit button to a loading indicator when the form is submitted
function changeImageResizerSubmitButton(selector) {
  const imageResizerSubmit = document.getElementById(selector);

  imageResizerSubmit.disabled = true;
  imageResizerSubmit.classList.add(
    'cursor-not-allowed',
    'bg-gray-300',
    'pointer-events-none',
    'shadow-none'
  );
  imageResizerSubmit.innerHTML = `<div role="status" class="flex justify-center items-center gap-2">
                                    <svg aria-hidden="true" class="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                                    <span class="">Resizing...</span>
                                </div>`;
}

// Toggles the visibility of the custom name input field based on the state of the switch
function toggleCustomName() {
  const customNameInput = document.getElementById('id_custom_name');
  const customNameWrapper = document.getElementById('custom_name_wrapper');
  const useCustomNameSwitch = document.getElementById('custom_name_switch');

  const isVisible = useCustomNameSwitch.checked;
  customNameInput.disabled = !isVisible;
  customNameWrapper.style.visibility = isVisible ? 'visible' : 'hidden';
}

// Checks the total size of the selected images and alerts the user if it exceeds the limit
function handleFileSelection() {
  const uploadField = document.getElementById('id_images');
  let uploadFieldSize = Array.from(uploadField.files).reduce(
    (total, file) => total + file.size,
    0
  );

  if (uploadFieldSize > 1048576 * 65) {
    alert(
      'The combined size of your images are too big!\nPlease select fewer images at a time.'
    );
    uploadField.value = '';
  }
}

// Handles the form submission
function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  changeImageResizerSubmitButton('resize-button');

  // Send the form data to the server, and download the resized images
  fetch('/image-resizer/', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resized_images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Redirect to the image resizer page
      window.location.href = '/image-resizer/';
    });
}

// Event listeners
document
  .getElementById('custom_name_switch')
  .addEventListener('click', toggleCustomName);
document
  .getElementById('id_images')
  .addEventListener('change', handleFileSelection);
document
  .getElementById('resizer-form')
  .addEventListener('submit', handleSubmit);
