const slugify = (str) =>
  str.replace(/[^a-zA-Z0-9_ -]+/g, '').replace(/\s+/g, '-');

export default slugify;
