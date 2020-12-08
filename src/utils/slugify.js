const slugify = (str) => str.replace(/[^\w ]+/g, '').replace(/\s+/g, '-');

export default slugify;
