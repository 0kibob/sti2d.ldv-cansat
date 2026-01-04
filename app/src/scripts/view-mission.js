const debuglabel = document.getElementById("debug")

const response = await fetch(`http://localhost:8000/gt_mission?m_id=1`);
const missions = await response.json();

debuglabel.innerText = JSON.stringify(missions)