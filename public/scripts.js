function searchLocation() {
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('location').value;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
        
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

async function handleLoggedInUser() {
  const token = localStorage.getItem('token');

  if (!token) {
    // Handle the case when there is no token in localStorage
    return;
  }
    const response = await fetch('/users/user', {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });
    if (response.ok) {
      const data = await response.json();
      //console.log(data.data.username)
      const userInfo = document.getElementById("user-info");
      userInfo.innerText = `username: ${data.data.username}`; 

      const userRole = data.data.role; 
      console.log(data.data.username);
      
    // Display different message based on user's role
      if (userRole === 'admin') {
        pendingBtn.style.display = "block";
        if(window.location.href.includes("spot.html")) {
          deleteBtn.style.display = "block";
          editBtn.style.display = "block";
        }
      } else {
        pendingBtn.style.display = "none";
        if(window.location.href.includes("spot.html")) {
          deleteBtn.style.display = "block";
          editBtn.style.display = "block";
        }
      }


        // Close the modal
      modal.style.display = "none";
      modalBtn.style.display = "none";
      logoutBtn.style.display = "block";
      submitBtn.style.display = "block";

        // Clear the login form
      loginForm.reset();
        ///////////

     /* try {
          fetch('/token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
          
        });
      } catch (error) {
        console.error(error);
      } */
      //console.log(token) 
      

    }
    else {
      //console.log("No user is logged in");
      const message = await response.text();
      console.error(message);
    }

}


function redirectToIndex() {
  window.location.href = "/";
}

const sessionId = document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*=\s*([^;]*).*$)|^.*$/, '$1');
localStorage.setItem('sessionId', sessionId);

// Get the modal element
var modal = document.getElementById("modal");

// Get the button that opens the modal
var modalBtn = document.getElementById("modalBtn");
var logoutBtn = document.getElementById("logoutBtn");
var submitBtn = document.getElementById("submitBtn");
var sponsorBtn = document.getElementById("sponsorBtn");
submitBtn.style.display = "none";
var pendingBtn = document.getElementById('pendingBtn');
pendingBtn.style.display = "none";

if(window.location.href.includes("spot.html")) {
  var editBtn = document.querySelector('#editBtn');
  editBtn.style.display = "none";
  var deleteBtn = document.querySelector('#deleteBtn');
  deleteBtn.style.display = "none"; 
}

// Get the close button element
var closeBtn = document.getElementsByClassName("close")[0];

// Get the login and signup form elements
var loginForm = document.getElementById("loginForm");
var signupForm = document.getElementById("signupForm");

// Get the form toggle links
var loginLink = document.getElementById("loginLink");
var signupLink = document.getElementById("signupLink");

// When the user clicks the button, open the modal
modalBtn.addEventListener("click", function() {
modal.style.display = "block";
loginForm.style.display = "block";
signupForm.style.display = "none";
});

// When the user clicks on the close button, close the modal
closeBtn.addEventListener("click", function() {
modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", function(event) {
if (event.target == modal) {
    modal.style.display = "none";
}
});

// When the user clicks on the login link, display the login form
loginLink.addEventListener("click", function() {
loginForm.style.display = "block";
signupForm.style.display = "none";
});

// When the user clicks on the signup link, display the signup form
signupLink.addEventListener("click", function() {
signupForm.style.display = "block";
loginForm.style.display = "none";
});

// When the user submits the login form, log them in
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginForm.elements[0].value;
    const password = loginForm.elements[1].value;
    //const token = localStorage.getItem('token');

    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
  
    if (response.ok) {
        // The user is now logged in, so set a session cookie with the user data
        const data = await response.json();
        //document.cookie = `session=${JSON.stringify(data)};path=/`;
        localStorage.setItem('token', data.token);
        // Update the user info element to show that the user is logged in
        const userInfo = document.getElementById("user-info");
        userInfo.innerText = `${data.username}`; 
        const userRole = data.role; 

        if (userRole === 'admin') {
          pendingBtn.style.display = "block";
        } else {
          pendingBtn.style.display = "none";
        }

        

        // Close the modal
        modal.style.display = "none";
        modalBtn.style.display = "none";
        logoutBtn.style.display = "block";
        submitBtn.style.display = "block";


        // Clear the login form
        loginForm.reset();

        location.reload();

    } else {
      // Login failed, display error message
      const message = await response.text();
      console.error(message);
    }
  });
  
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = signupForm.elements[0].value;
    const username = signupForm.elements[1].value;
    const password = signupForm.elements[2].value;
    const confirmPassword = signupForm.elements[3].value;
  
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        username,
        password
      })
    });
  
    if (response.ok) {
      // User signed up successfully, do something
      alert("Signup successfully, you can log in now");
      //signupForm.style.display = "none";
      modal.style.display = "none";
      //loginForm.style.display = "block";
      //signupForm.style.display = "none";

    } else {
      // Signup failed, display error message
      const message = await response.text();
      console.error(message);
    }
  });


logoutBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const response = await fetch('/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (response.ok) {
    localStorage.removeItem('token');
    submitBtn.style.display = "none";
    window.location.href = "/";
    console.log("Logout succesfully")
  } else {
    console.error('Failed to logout');
  }
});

window.addEventListener('load', async (event) => {
  event.preventDefault();
  //console.log(localStorage);
  const token = localStorage.getItem('token');

  if (!token) {
    // Handle the case when there is no token in localStorage
    return;
  }
    const response = await fetch('/users/user', {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });
    if (response.ok) {
      const data = await response.json();
      //console.log(data.data.username)
      const userInfo = document.getElementById("user-info");
      userInfo.innerText = `username: ${data.data.username}`; 

      const userRole = data.data.role; 
      
    // Display different message based on user's role
      if (userRole === 'admin') {
        pendingBtn.style.display = "block";
        if(window.location.href.includes("spot.html")) {
          deleteBtn.style.display = "block";
          editBtn.style.display = "block";
        }
      } else {
        pendingBtn.style.display = "none";
        if(window.location.href.includes("spot.html")) {
          deleteBtn.style.display = "none";
          editBtn.style.display = "none";
        }
      }


        // Close the modal
      modal.style.display = "none";
      modalBtn.style.display = "none";
      logoutBtn.style.display = "block";
      submitBtn.style.display = "block";

        // Clear the login form
      loginForm.reset();
        ///////////

     /* try {
          fetch('/token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
          
        });
      } catch (error) {
        console.error(error);
      } */
      //console.log(token) 
      

    }
    else {
      //console.log("No user is logged in");
      const message = await response.text();
      console.error(message);
    }
}); 

 submitBtn.addEventListener("click", function() {
  fetch('/submit')
    .then(function(response) {
      // Redirect to the new page
      window.location.href = response.url;
    });
  }); 


/////// verify address in submit form:

function checkAddress() {
  // Prevent the form from submitting
  //event.preventDefault();

  // Initialize the Geocoder
  var geocoder = new google.maps.Geocoder();

  // Get the user's inputted address from the HTML form
  var address = document.getElementById('location').value;

  // Call the geocode() method to verify the address
  geocoder.geocode( { 'address': address }, function(results, status) {
    if (status == 'OK') {
      // The address is valid
      var location = results[0].geometry.location;
      map.setCenter(location);
      marker.setPosition(location);

      var position = marker.getPosition();
      var lat = position.lat();
      var lng = position.lng();
      
      const latInput = document.querySelector('input[name="latitude"]');
      if (latInput) {
        latInput.value = lat;
      }

      const lngInput = document.querySelector('input[name="longitude"]');
      if (lngInput) {
        lngInput.value = lng;
      }

      const form = document.querySelector('#submitForm');
      const formData = new FormData(form);
      console.log(Object.fromEntries(formData.entries()));

      
    } else {
      // The address is invalid
      alert('Address is invalid');
      return;
    }
  });
}


function submitForm(event) {
  event.preventDefault();

  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput || fileInput.files.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  // Check if the address is valid
  const address = document.getElementById('location').value;
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': address }, function(results, status) {
    if (status !== 'OK') {
      alert('Invalid address');
      return;
    }

    const form = document.querySelector('#submitForm');
    const formData = new FormData(form);

    fetch('/auth/submit', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      //alert('Data submitted successfully');
      form.reset();
      //location.reload();
    })
    .catch(error => {
      console.error(error);
      form.reset();
      //alert('Error submitting form');
    });
  });
}



sponsorBtn.addEventListener('click', async(event) => {
  // Check the user's role here (for example, by accessing a global variable or making a request to the server)
  
  

  // Display different message based on user's role
    fetch('/sponsor')
    .then(function(response) {
      // Redirect to the new page
      window.location.href = response.url;
    });
  
});



////////  pending spots page button handle

/*pendingBtn.addEventListener('click', async(event) => {
  // Check the user's role here (for example, by accessing a global variable or making a request to the server)

  const token = localStorage.getItem('token');

  if (!token) {
    // Handle the case when there is no token in localStorage
    return;
  }
  
  const response = await fetch('/users/user', {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  });
  if (response.ok) {
    const data = await response.json();
    const userRole = data.data.role; 

    let message;

  // Display different message based on user's role
  if (userRole === 'admin') {
    fetch('/pending', {
      headers: {
        'Authorization': token
      }
    })
    .then(function(response) {
      // Redirect to the new page
      window.location.href = response.url;
    });
  }

  }
  else {
    const message = await response.text();
    console.error(message);
  }
  
}); */


pendingBtn.addEventListener('click', async(event) => {
  // Check the user's role here (for example, by accessing a global variable or making a request to the server)

  const token = localStorage.getItem('token');

  // Display different message based on user's role
    fetch('/pending', {
      headers: {
        'Authorization': token
      }
    })
    .then(function(response) {
      // Redirect to the new page
      window.location.href = response.url;
      //handleLoggedInUser();
    });
  
});

/*document.addEventListener('DOMContentLoaded', async(event) => {
  const token = localStorage.getItem('token');

  // Fetch data only if the user is authorized
  if (token) {
    fetch('/pending', {
      headers: {
        'Authorization': token
      }
    })
    .then(function(response) {
      // Redirect to the new page
      window.location.href = response.url;
    });
  }
}); */



const pendingData = document.getElementById('pending-data');
const modalImg = document.getElementById('modal-img');
const modalImage = document.getElementById('modal-image');
const spanImg = document.getElementsByClassName('close-img')[0];


fetch('/users/pending_data')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            const row = document.createElement('tr');
            let imagesHtml = '';
            item.images.forEach(image => {
                imagesHtml += `<img src="/images/${image}" alt="${image}" class="zoom-image"><br>`;
            });
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.location}</td>
                <td>${item.latitude}</td>
                <td>${item.longitude}</td>
                <td>${item.description}</td>
                <td>${imagesHtml}</td>
                <td><button class="accept-btn">Accept</button></td>
                <td><button class="decline-btn">Decline</button></td>
            `;
            pendingData.appendChild(row);
            //row.innerHTML = rowHtml;

            // add click event listener to the "Accept" button
            const acceptBtn = row.querySelector('.accept-btn');
            acceptBtn.addEventListener('click', () => {
                // call a function to add data to the spots_data table
                addDataToSpots(item);
                location.reload();
            });

            const declineBtn = row.querySelector('.decline-btn');
            declineBtn.addEventListener('click', () => {
                // call a function to add data to the spots_data table
                removePendingData(item);
                location.reload();
            });

            // add the row to the table body

            
        });

        // Add click event listener to all zoom images
        const zoomImages = document.getElementsByClassName('zoom-image');
        for (let i = 0; i < zoomImages.length; i++) {
            zoomImages[i].addEventListener('click', function() {
              modalImg.style.display = 'block';
              modalImage.src = this.src;
            });
        }

        // When the user clicks on <span> (x), close the modal
        spanImg.onclick = function() {
          modalImg.style.display = 'none';
        };

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modalImg) {
              modalImg.style.display = 'none';
            }
        }; 
    })
    .catch(error => console.error(error));


    function addDataToSpots(item) {
      // make a POST request to the server to add data to the spots_data table
      fetch('/auth/accepted_spots_data', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
      })
      .then(response => {
          if (response.ok) {
              console.log('Data added to spots_data table');
          } else {
              console.error('Error adding data to spots_data table');
          }
      })
      .catch(error => {
          console.error('Error adding data to spots_data table:', error);
      });
  }

  function removePendingData(item) {
    // make a POST request to the server to add data to the spots_data table
    fetch('/auth/declined_spots_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
    .then(response => {
        if (response.ok) {
            console.log('Data removed from pending_data table');
        } else {
            console.error('Error removing data from pending_data table');
        }
    })
    .catch(error => {
        console.error('Error removing data from pending_data table: ', error);
    });
}

function removeSpotData(id) {
  // make a POST request to the server to add data to the spots_data table
  fetch('/auth/deleted_spots_data', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify( { id } )
  })
  .then(response => {
      if (response.ok) {
          console.log('Data removed from spots_data table');
      } else {
          console.error('Error removing data from spots_data table');
      }
  })
  .catch(error => {
      console.error('Error removing data from spots_data table: ', error);
  });
}

function removeSponsorData(id) {
  // make a POST request to the server to add data to the spots_data table
  fetch('/auth/deleted_sponsor_data', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify( { id } )
  })
  .then(response => {
      if (response.ok) {
          console.log('Data removed from sponsor_me_data table');
      } else {
          console.error('Error removing data from sponsor_me_data table');
      }
  })
  .catch(error => {
      console.error('Error removing data from sponsor_me_data table: ', error);
  });
}


///////////////////////

function loadSpotData() {
  // Get the value of the 'id' parameter from the query string in the URL
  const queryParams = new URLSearchParams(window.location.search);
  const spotId = queryParams.get('id');
  const spotAddress = document.getElementById('spot-address');
  //console.log(spotId)

  // Make an AJAX request to your server-side API to retrieve the data for the spot with the given id
  fetch(`/users/spots/${spotId}`)
    .then(response => response.json())
    .then(spotData => {
      // Use the data to populate the HTML elements on the page
      const titleElement = document.getElementById('spot-title');
      titleElement.textContent = spotData.name;
      

      const descriptionElement = document.getElementById('spot-description');
      descriptionElement.textContent = spotData.description;


      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: parseFloat(spotData.latitude), lng: parseFloat(spotData.longitude) },
        zoom: 16,
      });
      const icon = {
        url: 'https://cdn-icons-png.flaticon.com/512/3374/3374330.png',
        scaledSize: new google.maps.Size(50, 50)
      };
      // Add a marker at the location of the spot
      new google.maps.Marker({
        position: { lat: parseFloat(spotData.latitude), lng: parseFloat(spotData.longitude) },
        map: map,
        title: spotData.name,
        icon: icon,
      });

      
      /////// reverse geocoding

      // Create a geocoder instance
      var geocoder = new google.maps.Geocoder();

      // Define the location as a LatLng object
      var location = new google.maps.LatLng(parseFloat(spotData.latitude), parseFloat(spotData.longitude));

      // Perform reverse geocoding
      geocoder.geocode({ 'location': location }, function(results, status) {
        if (status === 'OK') {
          if (results[0]) {
            // Extract the formatted address from the results
            var address = results[0].formatted_address;
            spotAddress.textContent += address;
            //console.log(address); // Display the street address in the console or use it as needed
          } else {
            spotAddress.textContent += 'No results found';
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      });


      ////////
      const imageFilenames = spotData.filenames;
      let mainImageIndex = 0;

      // Create an img element for each filename and append it to the spot-images div
      const spotImagesElement = document.getElementById('spot-images');
      imageFilenames.forEach((filename, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = `/images/${filename}`;
        imgElement.alt = filename;
        //imgElement.classList.add('zoom-image');
        //spotImagesElement.appendChild(imgElement);

        imgElement.addEventListener('click', () => {
          // Swap the clicked image with the main image
          const mainImage = document.getElementById('main-image');
          const tempSrc = mainImage.src;
          const tempAlt = mainImage.alt;
          mainImage.src = imgElement.src;
          mainImage.alt = imgElement.alt;
          imgElement.src = tempSrc;
          imgElement.alt = tempAlt;
          imgElement.classList.add('small-image');
          mainImage.classList.remove('small-image');
          mainImageIndex = index;
        });
      
        if (index === 0) {
          // Set the first image as the main image
          imgElement.id = 'main-image';
        } else {
          // Add a class to the other images to make them smaller
          imgElement.classList.add('small-image');
        }
      
        spotImagesElement.appendChild(imgElement);
      });
      
            deleteBtn.addEventListener('click', () => {
                // call a function to add data to the spots_data table
                console.log(spotId);
                removeSpotData(spotId);
                alert('Data removed succesfully');
                location.reload();
            });

            editBtn.addEventListener('click', () => {
              // toggle the contenteditable attribute
              titleElement.contentEditable = "true";
              descriptionElement.contentEditable = "true";
            
              // change the text of the edit button
              if (editBtn.innerText === 'Edit') {
                editBtn.innerText = 'Save';
              } else {
                editBtn.innerText = 'Edit';
                titleElement.contentEditable = "false";
                descriptionElement.contentEditable = "false";
                
                const newData = {
                  id: spotId,
                  title: titleElement.innerText.trim(),
                  description: descriptionElement.innerText.trim()
                };
                
                saveChanges(newData);
              }
            });
            

      
    

      // ... etc., for any other data you want to display
    })
    .catch(error => console.error(error));
}

function saveChanges(item) {
  
  // send a POST request to update the data on the server
  fetch('/auth/update_spots_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
    .then(response => {
      if (response.ok) {
        console.log('Data updated successfully');
      } else {
        console.error('Error updating data:', response.statusText);
      }
    })
    .catch(err => {
      console.error(err);
    });
}


function zoomImagesModal(){
  const zoomImages = document.getElementsByClassName('zoom-image');
        for (let i = 0; i < zoomImages.length; i++) {
            zoomImages[i].addEventListener('click', function() {
              modalImg.style.display = 'block';
              modalImage.src = this.src;
            });
        }

        // When the user clicks on <span> (x), close the modal
        spanImg.onclick = function() {
          modalImg.style.display = 'none';
        };

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modalImg) {
              modalImg.style.display = 'none';
            }
        }; 
}

const sponsorData = document.getElementById('sponsor-data');

const token = localStorage.getItem('token');
if (token) {
  fetch('/users/user', {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  })
  .then(response => response.json())
  .then(data => {
    const userRole = data.data.role;
    fetch('/users/sponsor_me_data')
      .then(response => response.json())
      .then(data => {
        data.forEach(item => {
          const row = document.createElement('tr');
          const videoId = item.video_url.split('v=')[1].split('&')[0];
          row.innerHTML = `
            <td>
              <iframe width="400" height="250" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </td>
            <td>${item.name}</td>
            <td>${item.skating_duration}</td>
            <td>${item.age}</td>
            <td>${item.contact}</td>
            ${userRole === 'admin' ? `<td><button style="background-color:red;font-size:24px;font-weight:600;color:#fff;padding:0px 25px;border:none;" class="delete-btn">Delete</button></td>` : ''}
          `;
          sponsorData.appendChild(row);
          
          if(userRole == 'admin'){
            const deleteBtn = row.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                // call a function to add data to the spots_data table
                removeSponsorData(item.id);
                location.reload();
            });
          }

        });
      })
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
} else {
  fetch('/users/sponsor_me_data')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const row = document.createElement('tr');
        const videoId = item.video_url.split('v=')[1].split('&')[0];
        row.innerHTML = `
          <td>
            <iframe width="400" height="250" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </td>
          <td>${item.name}</td>
          <td>${item.skating_duration}</td>
          <td>${item.age}</td>
          <td>${item.contact}</td>
        `;
        sponsorData.appendChild(row);           
      });
    })
    .catch(error => console.error(error));
}



    ////////////////////////// Sponsor Modal 

  var sponsorModal = document.getElementById("sponsorModal");

// Get the button that opens the modal
var sponsorFormBtn = document.getElementById("sponsorFormBtn");

// Get the <span> element that closes the modal
var sponsorSpan = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
function openSponsorModal() {
  sponsorModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
sponsorSpan.onclick = function() {
  sponsorModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == sponsorModal) {
    sponsorModal.style.display = "none";
  }
}

function submitSponsorForm(event) {
  event.preventDefault();

    const form = document.querySelector('#sponsorForm');

    if (!form) {
      console.error('Cannot find form element!');
      return;
    }

    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

  // log the form data to the console
    console.log(data);

    fetch('/auth/sponsor', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.text())
    .then(message => {
      alert(message);
      form.reset();
      location.reload();
    })
    .catch(error => {
      console.error(error);
      alert('Error submitting form');
    });
}

/////////// COMMENTS SECTION ////////////////

const commentsContainer = document.getElementById('comments-container');
const commentInput = document.getElementById('comment-input');
const submitCommentBtn = document.getElementById('submit-comment-btn');
const notLoggedComment = document.getElementById('notlogged-comment');

function initializeCommentSection() {
  // Get references to the comment section elements
  const token = localStorage.getItem('token');

  if (localStorage.getItem('token')) {
    submitCommentBtn.style.display = 'block';
    commentInput.style.display = 'block';
    notLoggedComment.style.display = 'none';
  } else {
    submitCommentBtn.style.display = 'none';
    commentInput.style.display = 'none';
    notLoggedComment.style.display = 'block';
  }

  // Get the ID of the item/page we are viewing comments for (you can get this from your backend)
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  // Function to display existing comments for the current item
  function displayComments(comments) {
    commentsContainer.innerHTML = ''; // Clear existing comments

    comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.classList.add('comment');
      commentDiv.innerHTML = `
      <div class="comment-first" style="
      display:flex;
      align-items:center;width:100%;">
        <h4 class="comment-author" style="margin-right:20px;">${comment.author}</h4>
        <h4 class="comment-date">${comment.created_at}</h4>
      </div>
      <p class="comment-text" style="font-size:20px;">${comment.text}</p>
      `;
      commentsContainer.appendChild(commentDiv);
    });
  }

  // Function to add a new comment to the database
  function addComment(text, author) {
    const date = new Date().toUTCString(); // Get current date and time
    const newComment = { text, author, date };
    console.log(newComment);
    // Send the new comment to the backend using a POST request
    fetch('/auth/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemId,
        comment: newComment
      })
    })
    .then(response => response.json())
    .then(data => {
      // Display the updated comments
      //displayComments(data.comments);
      //location.reload(); nu intra aici niciodata ??
    })
    .catch(error => {
      console.error('Error adding comment:', error);
    });
  } 

  // Event listener for submitting a new comment
  submitCommentBtn.addEventListener('click', event => {
    event.preventDefault(); // Prevent form submission
    /////// fetching username
    fetch('/users/user', {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('No user is logged in');
    })
    .then(data => {
      const commentText = commentInput.value.trim();
      const commentAuthor = data.data.username;
  
      if (commentText) {
        addComment(commentText, commentAuthor);
        commentInput.value = ''; // Clear the input field
        location.reload();
      }
    })
    .catch(error => {
      console.error(error.message);
    });


    ///////
    
  });

  // Initial call to display existing comments for the current item
    fetch(`/users/comments?itemId=${itemId}`)
    .then(response => response.json())
    .then(data => {
      displayComments(data.comments);
    })
    .catch(error => {
      console.error('Error fetching comments:', error);
    });
}

/////////////////////////////////////////////


// Get the button element by its ID
const addVideoBtn = document.getElementById('add-video-btn');

// Get the modal element by its ID
const videoModal = document.getElementById('addVideoModal');

// When the user clicks the button, open the modal
addVideoBtn.onclick = function() {
  videoModal.style.display = 'block';
}

var videoSpan = document.getElementsByClassName("close")[0];
videoSpan.onclick = function() {
  videoModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
// nu merge??
window.onclick = function(event) {
  if (event.target == videoModal) {
    videoModal.style.display = "none";
  }
}

const submitVideoBtn = document.getElementById('submit-video-btn');
const notLoggedVideo = document.getElementById('notlogged-video');
const videosContainer = document.getElementById('videos-container');
const videoInput = document.getElementById('videoFile');
const noVideosMessage = document.getElementById('no-videos');

function initializeVideoSection() {
  // Get references to the comment section elements
  const token = localStorage.getItem('token');

  if (localStorage.getItem('token')) {
    addVideoBtn.style.display = 'block';
    notLoggedVideo.style.display = 'none';
  } else {
    addVideoBtn.style.display = 'none';
    notLoggedVideo.style.display = 'block';
  }

  // Get the ID of the item/page we are viewing videos for (you can get this from your backend)
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  // Function to display existing videos for the current item
  function displayVideos(videos) {
    videosContainer.innerHTML = ''; // Clear existing videos

    videos.forEach(video => {
      const videoDiv = document.createElement('div');
      videoDiv.classList.add('video');
      videoDiv.innerHTML = `
        <video width="320" height="240" controls>
        <source src="videos/${video.filename}" type="video/mp4">
        Your browser does not support the video tag.
        </video>
        <p class="video-author">User: ${video.author}</p>
        <p class="video-date">Date: ${video.created_at}</p>
      `;
      videosContainer.appendChild(videoDiv);
      noVideosMessage.style.display = 'none';
    });
  }

  // Function to add a new comment to the database
  function addVideo(file, author) {
    const date = new Date().toUTCString(); // Get current date and time
    //const newVideo = { file, author, date };

    const formData = new FormData(); // Create a new FormData object
    formData.append('video', file); // Add the file to the form data
    formData.append('author', author);
    formData.append('spot_id', itemId);
    formData.append('date', date); // Add the author to the form data
    // Send the new comment to the backend using a POST request
    fetch('/auth/videos', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Display the updated comments
      //displayComments(data.comments);
      //location.reload(); nu intra aici niciodata ??
    })
    .catch(error => {
      console.error('Error adding comment:', error);
    });
  } 

  // Event listener for submitting a new comment
  submitVideoBtn.addEventListener('click', event => {
    event.preventDefault(); // Prevent form submission
    /////// fetching username
    fetch('/users/user', {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('No user is logged in');
    })
    .then(data => {
      const videoFile = videoInput.files[0];
      const videoAuthor = data.data.username;
  
      if (videoFile) {
        addVideo(videoFile, videoAuthor);
        videoInput.value = ''; // Clear the input field
        //location.reload();
      } 
    })
    .catch(error => {
      console.error(error.message);
    }); 


    ///////
    
  });

  // Initial call to display existing comments for the current item
    fetch(`/users/videos?itemId=${itemId}`)
    .then(response => response.json())
    .then(data => {
      displayVideos(data.videos);
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
    }); 
}