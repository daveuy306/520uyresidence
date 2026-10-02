async function testSync() {
  const ID = "ff808181a09d98f701a0fb946c785ef7";
  const url = `https://api.restful-api.dev/objects/${ID}`;

  // 1. Fetch
  const res1 = await fetch(url);
  const data1 = await res1.json();
  console.log("Fetch 1:", data1.data);

  // 2. Save
  const res2 = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Luxe Budget Global Storage",
      data: {
        categories: [{ id: 'inc_1', name: 'Salary' }],
        transactions: [{ id: 'tx_1', amount: 500 }],
        updatedAt: new Date().toISOString()
      }
    })
  });
  const data2 = await res2.json();
  console.log("Saved:", data2.data);

  // 3. Fetch again
  const res3 = await fetch(url);
  const data3 = await res3.json();
  console.log("Fetch 2:", data3.data);
}

testSync();
