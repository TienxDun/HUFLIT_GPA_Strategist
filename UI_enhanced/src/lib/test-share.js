
function encode(state) {
  const encoder = new TextEncoder();
  const buffers = [];

  const header = new Uint8Array(6);
  header[0] = 3;
  header[1] = Math.round(state.currentGPA * 60);
  header[2] = Math.min(state.currentCredits, 255);
  header[3] = Math.round(state.targetGPA * 60);
  header[4] = Math.min(state.remainingCredits, 255);
  header[5] = Math.min(state.retakes.length, 255);
  buffers.push(header);

  for (const item of state.retakes) {
    const nameBytes = encoder.encode(item.name || "");
    const itemMeta = new Uint8Array(4);
    itemMeta[0] = Math.round(item.oldGrade * 10);
    itemMeta[1] = Math.min(item.credits, 255);
    itemMeta[2] = item.targetGrade !== undefined ? Math.round(item.targetGrade * 10) : 255;
    itemMeta[3] = Math.min(nameBytes.length, 255);
    
    buffers.push(itemMeta);
    buffers.push(nameBytes.slice(0, 255));
  }

  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    combined.set(b, offset);
    offset += b.length;
  }

  return Buffer.from(combined).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const testState1 = { currentGPA: 2.76, currentCredits: 93, targetGPA: 3.2, remainingCredits: 33, retakes: [] };
const testState2 = { 
  currentGPA: 2.76, currentCredits: 93, targetGPA: 3.2, remainingCredits: 33, 
  retakes: [
    { name: 'Tiếng Anh tổng quát 2', oldGrade: 1.0, credits: 3, targetGrade: undefined },
    { name: 'Thuật toán đồ thị', oldGrade: 1.0, credits: 4, targetGrade: undefined }
  ] 
};

console.log("No retakes - Length:", encode(testState1).length);
console.log("With retakes - Length:", encode(testState2).length);
console.log("URL Example:", "http://localhost:3000/?s=" + encode(testState2));
