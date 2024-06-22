const startTime1 = new Date(1709803507 * 1000);
const endTime1 = new Date(1717748702 * 1000);
// const startTime2 = new Date(1715514295 * 1000);
// const endTime2 = new Date(1731415485 * 1000);

const now = new Date();

console.log(`Start Time 1: ${startTime1}`);
console.log(`End Time 1: ${endTime1}`);
console.log(`Is Offer 1 Active: ${now >= startTime1 && now <= endTime1}`);

// console.log(`Start Time 2: ${startTime2}`);
// console.log(`End Time 2: ${endTime2}`);
// console.log(`Is Offer 2 Active: ${now >= startTime2 && now <= endTime2}`);
