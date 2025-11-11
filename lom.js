
const copyBtn = document.getElementById('copyBtn');
const copyMessage = document.getElementById('copyMessage');
const textToCopy = document.getElementById('textToCopy');

if (copyBtn && textToCopy) {
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(textToCopy.textContent.trim())
            .then(() => {
                if (copyMessage) {
                    copyMessage.style.display = 'inline';
                    setTimeout(() => copyMessage.style.display = 'none', 1500);
                }
            })
            .catch(err => console.error('Failed to copy text: ', err));
    });
}
