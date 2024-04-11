const getCrafts = async() => {
    try {
        return (await fetch("/api/crafts/")).json();
    } catch(error){
        console.log("error retrieving data");
    }
};
  
  const showCrafts = async() => {
    const crafts = await getCrafts();
    const craftsDiv = document.getElementById("gallery");
    craftsDiv.innerHTML = "";

    crafts.forEach((craft)=>{
        const section = document.createElement("section");
        section.classList.add("craft");
        craftsDiv.append(section);

        const figure = document.createElement("figure");
        section.append(figure);

        const img = document.createElement("img");
        img.src = "./images/" + craft.img;
        figure.append(img);

        figure.onclick = (e) => {
            e.preventDefault();
            displayDetails(craft);
        };
    });
  };

  const displayDetails = (craft) => {
    openDialog("craft-details");

    const craftDetails = document.getElementById("craft-details");
    craftDetails.classList.add("columns");
    craftDetails.innerHTML = "";

    const picSec = document.createElement("section");
    picSec.classList.add("one");
    craftDetails.append(picSec);

    const pic = document.createElement("img");
    pic.src = "./images/" + craft.img;
    picSec.append(pic);

    const txtSec = document.createElement("section");
    txtSec.classList.add("two");
    craftDetails.append(txtSec);

    const dLink = document.createElement("a");
    dLink.innerHTML = "	&#9249;";
    txtSec.append(dLink);
    dLink.id = "delete-link";
  
    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    txtSec.append(eLink);
    eLink.id = "edit-link";

    const h3 = document.createElement("h3");
    h3.innerHTML = craft.name;
    txtSec.append(h3);

    const p = document.createElement("p");
    p.innerHTML = craft.description;
    txtSec.append(p);

    const h4 = document.createElement("h4");
    h4.innerHTML = "Supplies:";
    txtSec.append(h4);

    const ul = document.createElement("ul");
    txtSec.append(ul);

    craft.supplies.forEach((supply)=> {
        const li = document.createElement("li");
        li.innerHTML = supply;
        ul.append(li);
    });

    eLink.onclick = showCraftForm;
    dLink.onclick = () => openWarn(craft);
  
    populateEditForm(craft);

  };

  const populateEditForm = (craft)=>{
    const form = document.getElementById("add-craft-form");
    form._id.value = craft._id;
    form.name.value = craft.name;
    form.description.value = craft.description;
    document.getElementById("img-prev").src = "./images/" + craft.img;
    populateSupplies(craft.supplies);
  };

  const populateSupplies = (supplies) => {
    const section = document.getElementById("supply-boxes");
    supplies.forEach((supply) => {
        const input = document.createElement("input");
        section.append(input);
        input.type = 'text';
        input.value = supply;
    });
  };

const openDialog = (id) => {
    document.getElementById("dialog").style.display = "block";
    document.querySelectorAll("#dialog-details > *").forEach((item)=> {
        item.classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

const openWarn = (craft) => {
    document.getElementById("warn").style.display = "block";
    document.getElementById("dialog").style.display = "none";
    const btn = document.getElementById("del-final");
    btn.onclick = () => deleteCraft(craft);
}

const showCraftForm = (e) => {
    openDialog("add-craft-form");
    console.log(e.target);
    if (e.target.getAttribute("id") != "edit-link") {
      resetForm();
    }
  };

const addSupply = (e) => {
    e.preventDefault();
    const section = document.getElementById("supply-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
}

const resetForm = () => {
    const form = document.getElementById("add-craft-form");
    form.reset();
    document.getElementById("supply-boxes").innerHTML = "";
    document.getElementById("img-prev").src="";
};

const addEditCraft = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-craft-form");
    const formData = new FormData(form);
    let response;
    formData.append("supplies", getSupplies());
  
    console.log(...formData);
  
    //add request
    if (form._id.value.trim() == "") {
      console.log("in post");
      response = await fetch("/api/crafts", {
        method: "POST",
        body: formData,
      });
    } else {
      console.log("in put");
      response = await fetch(`/api/crafts/${form._id.value}`, {
        method: "PUT",
        body: formData,
      });
    }
  
    //successfully got data from server
    if (response.status != 200) {
      console.log("Error adding / editing data");
    }
  
    await response.json();
    resetForm();
    document.getElementById("dialog").style.display = "none";
    showCrafts();
  };

const deleteCraft = async(craft) =>{
    document.getElementById('warn').style.display='none';
    let response = await fetch(`/api/crafts/${craft._id}`,{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json;charset=utf-8",
      },
    });
  
    if(response.status!= 200){
      console.log("Error deleting");
      return;
    }
  
    let result = await response.json();
    resetForm();
    showCrafts();
    document.getElementById("dialog").style.display = "none";
  };

const getSupplies = () => {
    const inputs = document.querySelectorAll("#supply-boxes input");
    const supplies = [];

    inputs.forEach((input)=>{
        supplies.push(input.value);
    });

    return supplies;
}

//on Load

showCrafts();
document.getElementById("add-craft-form").onsubmit = addEditCraft;
document.getElementById("add-link").onclick = showCraftForm;
document.getElementById("add-supply").onclick = addSupply;

document.getElementById("img").onchange = (e) => {
    const prev = document.getElementById("img-prev");

    //they didn't pick an image
    if(!e.target.files.length){
        prev.src = "";
        return;
    }

    prev.src = URL.createObjectURL(e.target.files.item(0));
}