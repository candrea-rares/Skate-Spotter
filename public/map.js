var map;
		function initMap() {
			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 47.1585, lng: 27.6014},
				zoom: 12
			});
			map.spots = [];
			fetch('/spots')
          		.then(response => response.json())
          		.then(data => {
            		const markers = data.map(spot => {
  					const position = { lat: parseFloat(spot.latitude), lng: parseFloat(spot.longitude) };
					
					const icon = {
						url: 'https://cdn-icons-png.flaticon.com/512/3374/3374330.png',
						scaledSize: new google.maps.Size(50, 50)
					};
					var spotMarker = new google.maps.Marker({ position, title: spot.name, icon, map });

					// Attach a click event listener to the marker
					spotMarker.addListener('click', async function() {
						const token = localStorage.getItem('token');

						if (!token) {
							// Handle the case when there is no token in localStorage
							const queryParams = new URLSearchParams();
							//queryParams.append('title', spot.name);
							//queryParams.append('description', spot.description);
							queryParams.append('id', spot.id);
							window.location.href = '/spot.html?' + queryParams.toString();

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
						// Navigate to the spot.html page with the marker title as a query parameter
						//window.location.href = '/spot.html?title=' + encodeURIComponent(spot.name);
						const queryParams = new URLSearchParams();
						//queryParams.append('title', spot.name);
						//queryParams.append('description', spot.description);
						queryParams.append('id', spot.id);
    					window.location.href = '/spot.html?' + queryParams.toString();

						const userInfo = document.getElementById("user-info");
      					userInfo.innerText = `Logged in as ${data.data.username}`; 
						
						}
					});
					return spotMarker;
					});

    
          		})
          .catch(error => console.error(error));

  }
  

  function initMap_submitPage() {
	map = new google.maps.Map(document.getElementById('map-submit'), {
		zoom: 15,
		center: {lat: 47.1585, lng: 27.6014}
	  });
	
	  // Add a marker to the map
	  marker = new google.maps.Marker({
		map: map,
		draggable: true
	  });
	
	  // When the marker is dragged, update the latitude and longitude fields
	  marker.addListener('dragend', function() {
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

	  });
	}
