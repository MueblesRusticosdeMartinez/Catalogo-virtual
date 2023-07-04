const iconoMenu = document.querySelector('#icono-menu'),
    menu = document.querySelector('#menu');

iconoMenu.addEventListener('click', (e) => {

    menu.classList.toggle('active');
    document.body.classList.toggle('opacity');

    const rutaActual = e.target.getAtrribute('src');
    
    if(rutaActual == 'Imagenes/Menu.webp'){
        e.target.settAtribute('src', 'Imagenes/Menu2.webp');
    }else{
        e.target.settAtribute('src', 'Imagenes/Menu.webp');
    }

});