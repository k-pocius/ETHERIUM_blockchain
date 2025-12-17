// --- SETTINGS ---
const ARTIFACT_PATH = "./CoursePlatform.json";
// Pakeiskite šį adresą į savo deployed kontrakto adresą (Jūsų nurodytas adresas)
const CONTRACT_ADDRESS = "0xF028cE284eE9ded351d607c45Ee470345a71c13b"; 
// DĖMESIO: Šie mokesčiai naudojami tik sąsajos rodymui (kaip pradinės reikšmės)
const COURSE_FEE_ETH_FALLBACK = "0.005"; 
const INSTRUCTOR_FEE_ETH_FALLBACK = "0.005"; 

const coursesList = ["Matematika", "Anglų kalba", "Blockchain pagrindai", "Duomenų bazės"];
const instructorsList = ["Jonas Petraitis", "Ona Kazlauskaitė", "Algis Algimantas", "Eglė Morkūnaitė"];

// --- GLOBAL VARIABLES ---
let provider = null;
let signer = null;
let contract = null;
let contractABI = null;
let abiLoaded = false;
let selectedCourse = null;
let selectedInstructor = null;

// Vaidmenų adresai
let instructorAddressFromContract = null;


// --- DOM ELEMENTS (Atnaujinta pagal Jūsų HTML) ---
const courseContainer = document.getElementById("courses");
const instructorContainer = document.getElementById("instructors");
const connectBtn = document.getElementById("connectBtn");

const buyCourseServiceBtn = document.getElementById("buyCourseServiceBtn");
const courseFeeDisplay = document.getElementById("courseFeeDisplay");
const hireInstructorServiceBtn = document.getElementById("hireInstructorServiceBtn");
const instructorFeeDisplay = document.getElementById("instructorFeeDisplay");

const walletStatus = document.getElementById("walletStatus");
const accountEl = document.getElementById("account");
const networkEl = document.getElementById("network");
const statusLog = document.getElementById("statusLog");

const showCoursesBtn = document.getElementById("showCoursesBtn");
const showInstructorsBtn = document.getElementById("showInstructorsBtn");
const courseSelectionPanel = document.getElementById("courseSelectionPanel");
const instructorSelectionPanel = document.getElementById("instructorSelectionPanel");

const adminConfirmAccessBtn = document.getElementById("adminConfirmAccessBtn");
const studentAcceptCourseBtn = document.getElementById("studentAcceptCourseBtn");
const requestCourseRefundBtn = document.getElementById("requestCourseRefundBtn");
const approveCourseRefundBtn = document.getElementById("approveCourseRefundBtn");

const markHelpProvidedBtn = document.getElementById("markHelpProvidedBtn");
const confirmInstructorServiceBtn = document.getElementById("confirmInstructorServiceBtn");
const requestInstructorRefundBtn = document.getElementById("requestInstructorRefundBtn");
const approveInstructorRefundBtn = document.getElementById("approveInstructorRefundBtn");


// --- LOG FUNCTION ---
function log(msg) {
    const time = new Date().toLocaleTimeString();
    statusLog.textContent += `[${time}] ${msg}\n`;
    statusLog.scrollTop = statusLog.scrollHeight;
    console.log(`[${time}] ${msg}`);
}

// --- LOAD ABI ---
async function loadABI() {
    try {
        const res = await fetch(ARTIFACT_PATH);
        if (!res.ok) throw new Error(`ABI failas nerastas: ${res.status}`);
        
        const data = await res.json();
        
        if (data.abi) {
            contractABI = data.abi;
        } else if (Array.isArray(data)) {
            contractABI = data;
        } else {
            throw new Error("JSON faile nerastas validus ABI masyvas.");
        }

        abiLoaded = true;
        log("ABI sėkmingai įkeltas.");
        resetContractIfReady();
        updateButtonStates();
    } catch (err) {
        console.error(err);
        log("Klaida įkeliant ABI: " + err.message);
    }
}

// --- NUSKAITYTI KONTAKTO ADRESUS (Reikalinga Instructoriaus samdymui) ---
async function fetchContractAddresses() {
    if (!contract) return;
    try {
        // Skaitome tik tą adresą, kuris bus reikalingas Instruktoriaus samdymo funkcijoje
        // Tai yra VIEW kvietimas, kuris gali sukelti klaidą, jei kontraktas dar neinicijuotas
        instructorAddressFromContract = await contract.instructor();
        log(`Instruktoriaus adresas nuskaitytas: ${instructorAddressFromContract.slice(0, 10)}...`);
    } catch (error) {
        // Ignoruojame klaidas, jei nepavyksta nuskaityti adreso, bet leidžiame toliau veikti
        console.error("Klaida nuskaitant instruktoriaus adresą:", error);
        log("Klaida nuskaitant instruktoriaus adresą. Patikrinkite, ar ABI teisingas.");
    }
}

// --- BŪSENOS TIKRINIMAS KONSOLEI ---
async function checkContractState() {
    if (!contract) {
        console.warn("Kontraktas neinicijuotas. Pirmiausia prisijunkite.");
        return;
    }

    try {
        const state = await contract.courseState();
        const feeWei = await contract.courseFee();
        
        const stateValue = state.toNumber ? state.toNumber() : state.toString();
        const feeEth = ethers.utils.formatEther(feeWei);

        console.log("--- KONTRAKTO BŪSENOS PATIKRINIMAS (KONSOLE) ---");
        console.log(`courseState (Enum skaičius): ${stateValue}`);
        console.log(`courseFee (ETH): ${feeEth} ETH`);
        console.log("-----------------------------------------------");
        
        if (stateValue !== 0) {
             console.warn(`DĖMESIO: Dabartinė courseState yra ${stateValue}. Mokėjimas paprastai reikalauja, kad būsena būtų 0 (CourseCreated).`);
        }
        if (feeWei.isZero()) {
             console.error("KRITINĖ KLAIDA: courseFee grąžina 0. Patikrinkite kontrakto inicializaciją/ABI.");
        }
        
        return { courseState: stateValue, courseFee: feeEth };

    } catch (error) {
        console.error("Klaida nuskaitant kontrakto būseną. Patikrinkite, ar ABI teisingas ir VIEW funkcijos veikia:", error);
    }
}
// ------------------------------------


// --- CREATE CONTRACT INSTANCE ---
function resetContractIfReady() {
    if (provider && signer && abiLoaded && contractABI) {
        try {
            contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
            log(`Kontrakto egzempliorius sukurtas adresu ${CONTRACT_ADDRESS.slice(0, 6)}...`);
            fetchContractAddresses(); // Bandome gauti adresus
            listenToContractEvents();
            updateButtonStates();
        } catch (err) {
            console.error(err);
            log("Klaida inicijuojant kontraktą: " + err.message);
        }
    } 
}

// --- GENERATE OPTIONS ---
function generateOptions() {
    // Naudojame FALLBACK mokesčius rodymui
    courseFeeDisplay.textContent = `${COURSE_FEE_ETH_FALLBACK} ETH`;
    instructorFeeDisplay.textContent = `${INSTRUCTOR_FEE_ETH_FALLBACK} ETH`;
    
    coursesList.forEach(c => {
        const div = document.createElement("div");
        div.classList.add("option");
        div.textContent = c;
        div.addEventListener("click", () => {
            document.querySelectorAll("#courses .option").forEach(o => o.classList.remove("selected"));
            div.classList.add("selected");
            selectedCourse = c;
            selectedInstructor = null; 
            document.querySelectorAll("#instructors .option").forEach(o => o.classList.remove("selected"));
            log(`Pasirinktas kursas: ${c}`);
            updateButtonStates();
        });
        courseContainer.appendChild(div);
    });

    instructorsList.forEach(i => {
        const div = document.createElement("div");
        div.classList.add("option");
        div.textContent = i;
        div.addEventListener("click", () => {
            document.querySelectorAll("#instructors .option").forEach(o => o.classList.remove("selected"));
            div.classList.add("selected");
            selectedInstructor = i;
            selectedCourse = null; 
            document.querySelectorAll("#courses .option").forEach(o => o.classList.remove("selected"));
            log(`Pasirinktas instruktorius: ${i}`);
            updateButtonStates();
        });
        instructorContainer.appendChild(div);
    });
}

// --- CONNECT WALLET ---
async function connectWallet() {
    if (!window.ethereum) {
        alert("Prašome įdiegti MetaMask!");
        return;
    }

    try {
        log("Jungiamasi prie MetaMask...");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
            log("Vartotojas atmetė prisijungimą.");
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        const account = accounts[0];
        const network = await provider.getNetwork();

        // UI ATNAUJINIMAS
        connectBtn.textContent = account.slice(0,6) + "..." + account.slice(-4);
        walletStatus.textContent = "Prisijungęs";
        walletStatus.classList.remove("disconnected");
        walletStatus.classList.add("connected");
        accountEl.textContent = account;
        networkEl.textContent = `${network.name} (Chain ID: ${network.chainId})`;
        
        // PAŠALINTOS PROBLEMINĖS EILUTĖS: 
        // document.getElementById('userRoleDisplay').textContent = "Nenustatytas (Prisijungęs)"; 
        // document.getElementById('courseStateDisplay').textContent = "UI rodymas išjungtas";
        // document.getElementById('instructorStateDisplay').textContent = "UI rodymas išjungtas";


        resetContractIfReady();
        log(`Piniginė prijungta: ${account}`);
    } catch (err) {
        // Svarbu: Jei prisijungimas prie MetaMask PAVYKO (piniginė rodo statusą prisijungęs),
        // bet įvyko klaida atnaujinant UI (kas ir įvyko), tai reiškia, kad
        // Ethers.js kodas veikia, bet DOM manipuliacija - ne.
        console.error(err);
        log("Nepavyko prisijungti prie piniginės: " + (err.message || err));
        
        // Išlaikome alert, bet tikėtina, kad prisijungimas PUSIAU pavyko.
        // Alert("Nepavyko prisijungti prie piniginės!"); // Galima užkomentuoti, kad neblaškytų
    }
}


// --- SUPAPRASTINTAS MYGTUKŲ VALDYMAS ---
function updateButtonStates() {
    const isConnected = !!(provider && signer && contract);
    
    // Visi veiksmo mygtukai (sandorių veiksmai) įjungiami, jei prisijungta
    document.querySelectorAll('.action-step .action-button').forEach(btn => btn.disabled = !isConnected);

    // Įjungti pirkimo mygtukus, jei pasirinkimas yra
    buyCourseServiceBtn.disabled = !isConnected || !selectedCourse;
    hireInstructorServiceBtn.disabled = !isConnected || !selectedInstructor;

    if (isConnected) {
        // Atnaujiname adresus (jei pavyko juos nuskaityti)
        fetchContractAddresses(); 
    }
}


// ----------------------------------------------------
// --- SMART KONTRAKTO FUNKCIJOS ---
// ----------------------------------------------------

// Bendroji transakcijos tvarkymo funkcija
async function handleTransaction(txPromise, successMsg) {
    try {
        const tx = await txPromise;
        log(`Transakcija išsiųsta: ${tx.hash}. Laukiama patvirtinimo...`);
        
        await tx.wait();
        
        log(`Sėkmė! ${successMsg}`);
        alert(successMsg);
        updateButtonStates(); 
    } catch (err) {
        console.error(err);
        const reason = err.data ? err.data.message : (err.reason || err.message);
        log(`Transakcija nepavyko: ${reason}`);
        alert(`Transakcija nepavyko: ${reason}`);
    }
}


// 1. KURSO PIRKIMAS (payCourseFee)
async function buyCourseService() {
    if (!contract || !selectedCourse) return alert("Pasirinkite kursą ir prijunkite piniginę.");
    
    try {
        const courseFee = await contract.courseFee();
        log(`Siunčiamas kursų mokestis (${ethers.utils.formatEther(courseFee)} ETH)...`);
        
        const txPromise = contract.payCourseFee({ value: courseFee });
        await handleTransaction(txPromise, "Kurso mokestis apmokėtas! Laukiamas Platformos patvirtinimas.");
    } catch (err) {
        console.error(err);
        alert("Klaida gaunant mokestį arba siunčiant transakciją: " + (err.reason || err.message));
    }
}

// 2. KURSO PRIEIGOS PATVIRTINIMAS (confirmCourseAccess)
async function adminConfirmAccess() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.confirmCourseAccess();
    await handleTransaction(txPromise, "Prieiga patvirtinta. Studentas turi patvirtinti kursą.");
}

// 3. KURSO PATVIRTINIMAS IR UŽBAIGIMAS (acceptCourse)
async function studentAcceptCourse() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.acceptCourse();
    await handleTransaction(txPromise, "Kursas sėkmingai patvirtintas ir užbaigtas!");
}

// 4. PRAŠYMAS GRĄŽINTI KURSĄ (requestRefundCourse)
async function requestCourseRefund() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.requestRefundCourse();
    await handleTransaction(txPromise, "Kurso grąžinimo prašymas išsiųstas. Laukiamas Platformos patvirtinimas.");
}

// 5. PATVIRTINTI KURSO GRĄŽINIMĄ (approveRefundCourse)
async function approveCourseRefund() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.approveRefundCourse();
    await handleTransaction(txPromise, "Kurso grąžinimas sėkmingai patvirtintas!");
}


// 6. INSTRUKTORIAUS SAMDYMAS (selectInstructor + payInstructorFee)
async function hireInstructorService() {
    if (!contract || !selectedInstructor || !instructorAddressFromContract) return alert("Pasirinkite instruktorių ir prijunkite piniginę. Taip pat įsitikinkite, kad pavyko nuskaityti Instruktoriaus adresą iš kontrakto.");

    try {
        // 1. Pasirinkti instruktorių
        await contract.selectInstructor(instructorAddressFromContract, selectedInstructor);
        log(`Instruktorius "${selectedInstructor}" pasirinktas.`);

        // 2. Apmokėti
        const instructorFee = await contract.instructorFee();
        log(`Siunčiamas instruktoriaus mokestis (${ethers.utils.formatEther(instructorFee)} ETH)...`);
        
        const txPromise = contract.payInstructorFee({ value: instructorFee });
        await handleTransaction(txPromise, "Instruktorius sėkmingai pasamdytas!");
    } catch (err) {
        console.error(err);
        alert("Klaida samdant instruktorių: " + (err.reason || err.message));
    }
}

// 7. INSTRUKTORIUS PAŽYMI PAGALBĄ (markHelpProvided)
async function markHelpProvided() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.markHelpProvided();
    await handleTransaction(txPromise, "Instruktorius patvirtino pagalbą!");
}

// 8. PLATFORMA PATVIRTINA INSTRUKTORIAUS PASLAUGĄ (confirmInstructorService)
async function confirmInstructorService() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.confirmInstructorService();
    await handleTransaction(txPromise, "Instruktoriaus paslauga sėkmingai patvirtinta!");
}

// 9. PRAŠYMAS GRĄŽINTI INSTRUKTORIAUS MOKESTĮ (requestRefundInstructor)
async function requestInstructorRefund() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.requestRefundInstructor();
    await handleTransaction(txPromise, "Instruktoriaus grąžinimo prašymas išsiųstas. Laukiamas Platformos patvirtinimas.");
}

// 10. PATVIRTINTI INSTRUKTORIAUS GRĄŽINIMĄ (approveRefundInstructor)
async function approveInstructorRefund() {
    if (!contract) return alert("Prijunkite piniginę.");
    const txPromise = contract.approveRefundInstructor();
    await handleTransaction(txPromise, "Instruktoriaus grąžinimas sėkmingai patvirtintas!");
}


// ----------------------------------------------------
// --- ĮVYKIŲ KLAUSYMAS (LISTENERS) ---
// ----------------------------------------------------
function listenToContractEvents() {
    if (!contract) return;
    
    contract.on("PaymentReceived", (platform, amount) => {
        log(`[ĮVYKIS] Apomokėjimas gautas: ${ethers.utils.formatEther(amount)} ETH`);
    });
    
    contract.on("CourseCompletedEvent", () => {
        log(`[ĮVYKIS] Kursas baigtas!`);
    });
    
    contract.on("RefundProcessed", () => {
        log(`[ĮVYKIS] Lėšos grąžintos Studentui.`);
    });
    
    log("Kontrakto įvykiai pradėti klausytis...");
}


// ----------------------------------------------------
// --- INICIALIZAVIMAS IR JUNGTYS ---
// ----------------------------------------------------

function setupEventListeners() {
    connectBtn.addEventListener("click", connectWallet);
    buyCourseServiceBtn.addEventListener("click", buyCourseService);
    adminConfirmAccessBtn.addEventListener("click", adminConfirmAccess);
    studentAcceptCourseBtn.addEventListener("click", studentAcceptCourse);
    requestCourseRefundBtn.addEventListener("click", requestCourseRefund);
    approveCourseRefundBtn.addEventListener("click", approveCourseRefund);

    hireInstructorServiceBtn.addEventListener("click", hireInstructorService);
    markHelpProvidedBtn.addEventListener("click", markHelpProvided);
    confirmInstructorServiceBtn.addEventListener("click", confirmInstructorService);
    requestInstructorRefundBtn.addEventListener("click", requestInstructorRefund);
    approveInstructorRefundBtn.addEventListener("click", approveInstructorRefund);
    
    // Toggles
    showCoursesBtn.addEventListener("click", () => {
        courseSelectionPanel.classList.remove("hidden");
        instructorSelectionPanel.classList.add("hidden");
        showCoursesBtn.classList.add("active");
        showInstructorsBtn.classList.remove("active");
    });

    showInstructorsBtn.addEventListener("click", () => {
        instructorSelectionPanel.classList.remove("hidden");
        courseSelectionPanel.classList.add("hidden");
        showInstructorsBtn.classList.add("active");
        showCoursesBtn.classList.remove("active");
    });
}

window.addEventListener('load', () => {
    loadABI();
    generateOptions();
    setupEventListeners();
    updateButtonStates();
    
    // MetaMask įvykių klausymas
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', () => {
            window.location.reload(); 
        });
        window.ethereum.on('chainChanged', () => {
            window.location.reload(); 
        });
    }
});