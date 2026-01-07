const debuglabel = document.getElementById("debug");

export default async function({ params }) {

    debuglabel.innerText = params.data

}
