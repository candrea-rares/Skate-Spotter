const buton = document.querySelector('.hamburger');
const spots = document.querySelector('.spots');

buton.addEventListener('click',function(){
    spots.classList.toggle('active');
})