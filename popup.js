document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const autofillBtn = document.getElementById("autofillBtn");

    let selectedFile = null;

    if (fileInput) {
        console.log('File input found');
        fileInput.addEventListener('change', handleFileSelect);
    } else {
        console.error('File input not found');
    }

    if (autofillBtn) {
        console.log('Autofill button found');
        autofillBtn.addEventListener("click", sendAutofillMessage);
    } else {
        console.error("Autofill button not found in the DOM");
    }

    function handleFileSelect(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            console.log('File selected:', selectedFile.name);
        } else {
            console.error('No file selected');
        }
    }

    function sendAutofillMessage() {
        console.log('Autofill message initiated');

        if (!selectedFile) {
            console.error('No image file selected for autofill');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        fetch('http://97.70.236.220:8082/run-script', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('Received response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Network response was ok');
            return response.json();
        })
        .then(data => {
            console.log('Response from Flask server:', data);
            if (data.error) {
                console.error('Error from Flask server:', data.error);
            } else {
                sendResponseToContentScript(data.output);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function sendResponseToContentScript(response) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id },
                    function: autofillData,
                    args: [response]
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Content script executed successfully.');
                    }
                }
            );
        });
    }

    function autofillData(data) {
        console.log('Received data:', data);

        const fieldMap = {
            // 'Username': 'username',
            // 'Password': 'password',
            // 'Email': 'email',
            // 'Address': 'address',
            // 'Phone': 'phone'

            'Patient ID': 'patientId',
            'Name': 'name',
            'Species': 'species',
            'Breed': 'breed',
            'Age/DOB Years': 'ageyears',
            'Age/DOB Months': 'agemonths',
            'Gender': 'gender',
            'Color/Markings': 'color',
            'Microchip ID': 'microchipId',
            'Owner Name': 'ownerName',
            'Contact Number': 'contactNumber',
            'Address': 'address',
            'Email': 'email',
            'Condition': 'condition',
            'Date Diagnosed': 'dateDiagnosed',
            'Treatment Provided': 'treatment',
            'Outcome/Current Status': 'outcome'

        };

        const lines = data.split('\n');
        console.log('Split data:', lines);

        const fields = {};

        lines.forEach(line => {
            for (const key in fieldMap) {
                if (line.startsWith(key)) {
                    fields[fieldMap[key]] = line.split(':')[1].trim();
                }
            }
        });

        console.log('Extracted fields:', fields);

        for (const id in fields) {
            const element = document.getElementById(id);
            if (element) {
                element.value = fields[id];
                console.log(`${id} field found and filled with value: ${fields[id]}`);
            } else {
                console.error(`${id} field NOT found in the DOM.`);
            }
        }
    }
});
  