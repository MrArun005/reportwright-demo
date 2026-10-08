// src/exporters/deadline.js
function withDeadline(work, ms) {
  if (!(Number(ms) > 0)) return work;
  let timer;
  const late = new Promise((_, rej) => {
    timer = setTimeout(() => rej(Object.assign(new Error(`The export took longer than ${ms} ms`), { status: 504 })), Number(ms));
  });
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}

export {
  withDeadline
};
