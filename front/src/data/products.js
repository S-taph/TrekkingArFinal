const tagsDisponibles = ['Nuevo', 'Best Seller', 'Exclusivo'];

const products = [
  {
    id: 1,
    name: 'Caminata al Cerro Catedral',
    category: 'Montaña',
    price: 550000,
    rating: 4.5,
    image: '/banner2.jpg',
  },
  {
    id: 2,
    name: 'Ruta del Vino en Mendoza',
    category: 'Cultural',
    price: 450000,
    rating: 4.7,
    image: '/banner3.jpg',
  },
  {
    id: 3,
    name: 'Sendero de los Glaciares',
    category: 'Montaña',
    price: 750000,
    rating: 4.8,
    image: '/banner1.jpg',
  },
  {
    id: 4,
    name: 'Trekking en El Chaltén',
    image: '/banner4.jpg',
    price: 16000,
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Aventura en Salta y Jujuy',
    image: '/banner5.jpg',
    price: 14000,
    rating: 4.6,
  },
  {
    id: 6,
    name: 'Exploración en Tierra del Fuego',
    image: '/banner6.jpg',
    price: 20000,
    rating: 4.9,
  },
].map((prod) => ({
  ...prod,
  tag: tagsDisponibles[Math.floor(Math.random() * tagsDisponibles.length)],
}));

export default products;