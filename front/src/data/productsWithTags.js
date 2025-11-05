import products from './products';

const tags = ['Nuevo', 'Best Seller', '20% Off', 'Recomendado', 'Edición Limitada', 'Oferta Especial', 'En Stock', 'Próximamente'];

function getRandomTag() {
  return tags[Math.floor(Math.random() * tags.length)];
}

const productsWithTags = products.map(product => ({
  ...product,
  tag: getRandomTag(),
}));

export default productsWithTags;
