/*
Proyecto de Balugano Juan Manuel :  archivo main.js contiene la logica de carrito 
Version 3.0 
La estructura de datos se basa en,  constantes para el llamado al DOM a sus respectivos Id 
una funcion con la libreria JQuery (eso me falto en mi entrega pasada y la agregue para mostrar un uso de Jquery LINEA 27)
Constantes que contienen todas las funciones iniciadas en LINEAS : 40, 51, 65, 73, 90, 114,147.

Lo aprendido desde tipos de datos primitivos pasando por operadores, fui conociendo las condicionales(if, switch)
los bucles (for, while, forEach), manipular el DOM para generar eventos ejemplo con click, saber incorporar la libreria 
la use poco para conocer bien JS vanilla o nativo ya que es mi primer proyecto.
Funciones asincronicas con uso de Fetch para cargar datos estaticos con JSON.
El uso de LocalStorage, aplique destructuring en funcion LINEA 151

Profesor : KbZ - Comision 30340
*/

//Accedemos a los id items 
const cards = document.querySelector('#cards');
const items =document.querySelector('#items');
const footer =document.querySelector('#footer');
//Accedemos a los template
const cardsTemplate = document.querySelector('#template-card').content;
const footerTemplate = document.querySelector('#template-footer').content;
const carritoTemplate = document.querySelector('#template-carrito').content;
//fragment-Crea un nuevo DocumentFragment vacio, dentro del cual un nodo del DOM puede ser adicionado para construir un nuevo arbol del DOM
const fragment = document.createDocumentFragment();
//Carrito
let carrito = {};

//primero que cargue todo el html, dps el json, dps localStorage---Funcion con jquery
$(document).ready(function(){
  api();
  if(localStorage.getItem('carrito')){
      carrito = JSON.parse(localStorage.getItem('carrito'))
      pintarCarrito()
  }
});

//Evento click en tarjetas y en botones de incremento decremento
cards.addEventListener('click',e  => agregarCarrito(e) );
items.addEventListener('click',e  => btnCantidades(e) );

//Variable que contiene funcion asincrona que llama mediante fetch al .json
 const  api = async()=>{
  try{
    const respuesta = await fetch('./productos.json')
    const guardarData = await respuesta.json()
    MostrarCards(guardarData)
  }catch(error){
    console.log(error)
  }  
};   

//Composicion de tarjeta para aniadir al fragment de tarjeta
const MostrarCards = elementos =>{
  elementos.forEach(indumentaria=>{
      cardsTemplate.querySelector('h5').textContent = indumentaria.nombre
      cardsTemplate.querySelector('p').textContent  = indumentaria.precio
      cardsTemplate.querySelector('img').setAttribute('src', indumentaria.img)
      cardsTemplate.querySelector('.btn').dataset.id =indumentaria.id

      const clon = cardsTemplate.cloneNode(true);
      fragment.appendChild(clon);
    });
    cards.appendChild(fragment);
};

//funcion con la logica de cuando el usuario hace click en cualquier boton comprar
const agregarCarrito = (e)=>{
if(e.target.classList.contains('btn') === true){
    crearItemCarrito(e.target.parentElement);
  }
  e.stopPropagation();
};

//Funcion que crea el objeto del item comprado por el usr
const crearItemCarrito = itemCreado => {
     const producto = {
       id : itemCreado.querySelector('.btn').dataset.id,
       nombre : itemCreado.querySelector('h5').textContent,
       precio : itemCreado.querySelector('p').textContent,
       cantidad : 1
      }    
      //logica de aumentar cantidad de item comprado desde carrito
      if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1
      } 
      
      //empujar objeto a carrito
      carrito[producto.id] = {...producto}
      pintarCarrito()
};

//Esta funcion tiene la logica de tomar datos, copiar template, agregarlo para que se vea en footer, y guardado de LocalStorage      
const pintarCarrito = ()=>{
    items.innerHTML = ''
  //Object devuelve un array con los valores de un objeto en su mismo orden
   Object.values(carrito).forEach(producto =>{
    carritoTemplate.querySelector('th').textContent = producto.id
    carritoTemplate.querySelectorAll('td')[0].textContent = producto.nombre
    carritoTemplate.querySelectorAll('td')[1].textContent = producto.cantidad
    carritoTemplate.querySelector('.btn-success').dataset.id = producto.id
    carritoTemplate.querySelector('.btn-danger').dataset.id = producto.id
    carritoTemplate.querySelector('span').textContent = producto.cantidad * producto.precio 
    //cloneNode hace un clon del nodo llamado, en este caso carritoTemplate, y con parametro true le digo que copie tmb sus hijos
    const clon = carritoTemplate.cloneNode(true)
    fragment.appendChild(clon)
    
  }) 
  items.appendChild(fragment);

  
  mostrarFooter()
   
   //Guardo los elementos del localStorage
   localStorage.setItem('carrito', JSON.stringify(carrito));
};

//Funcion que muestra un mensaje de carrito vacio mientras no halla nada, y un alert para futuro incorporar medios de pago
const mostrarFooter = ()=>{
  //mostrar footer vacio
  footer.innerHTML = " "
  //verifico si carrito esta vacio
  if(Object.keys(carrito).length === 0 ){
    footer.innerHTML = `
    <th class=" text-start fs-3" scope="row" >Carrito vacío</th>
    `
    return;
  }//logica de suma precio total,  y cantidad total hecho con reduce 
  const sumaDeCantidades = Object.values(carrito).reduce(( acumulador, {cantidad} )=> acumulador + cantidad  , 0 );
  const nprecio = Object.values(carrito).reduce(( acumulador, {cantidad, precio} ) => acumulador + cantidad * precio , 0);
  //seleccion de etiquetas del html para insertar logica
  footerTemplate.querySelectorAll('td')[0].textContent = sumaDeCantidades;
  footerTemplate.querySelector('span').textContent = nprecio
  //clon de template
  const clon = footerTemplate.cloneNode(true)
  fragment.appendChild(clon)
  footer.appendChild(fragment)
  //funcion de flecha de boton vaciar carrito
  const btnVaciar = document.querySelector('#vaciar-carrito');
        btnVaciar.addEventListener('click', () => {
           carrito = {};
           pintarCarrito();
        });        
        const btnCompraFin = document.querySelector('#comprar-carrito');
              btnCompraFin.addEventListener('click', () => {
                alert('Pronto daremos medios de pago');
                carrito = {};
                pintarCarrito();
         });       
};

//Funcion que da incremento y decremento a productos dentro del carrito
const btnCantidades = (e)=>{
    if(e.target.classList.contains('btn-success')){
      //Accion de aumentar
          //Acceder desde objeto carrito 
      const producto = carrito[e.target.dataset.id]
            producto.cantidad++
            carrito[e.target.dataset.id] = {...producto}
            pintarCarrito();
    }
    if (e.target.classList.contains('btn-danger')) {
      const producto = carrito[e.target.dataset.id]
      producto.cantidad--
      //si producto es 0 eliminamos el objeto 
      if (producto.cantidad === 0) {
          delete carrito[e.target.dataset.id]
      } else {
          carrito[e.target.dataset.id] = {...producto}
      }
      pintarCarrito()
    }
    e.stopPropagation()
};