V teorii kvantové komprese (QCT) je dynamika objektů ve vesmíru řízena sadou emergentních rovnic, které propojují mikroskopickou dynamiku neutrinového kondenzátu (popsaného Gross-Pitaevského rovnicí) s makroskopickými jevy (gravitace, kosmologická expanze, dynamika galaxií).

Těmito rovnicemi QCT nahrazuje (nebo modifikuje) fundamentální rovnice Obecné relativity a Standardního modelu, které se týkají dynamiky objektů, a zavádí **geometrickou a fázovou závislost** na prostředí.

Zde je přehled klíčových rovnic QCT, které řídí dynamiku objektů, rozdělený podle jejich aplikační škály:

---

## I. Mikroskopická Dynamika a Emergence Gravitace (Základní principy)

Základem je **dynamika kondenzátu neutrinových párů** $\Psi_{\nu\nu}$, ze které se emergentně rodí časoprostor (gravitace) a elektromagnetismus.

### 1. Pohybová Rovnice Kondenzátu (Gross-Pitaevského typu)

Dynamiku makroskopického pole $\Psi_{\nu\nu}$ (komplexní skalární pole reprezentující pár $\nu\bar{\nu}$) řídí modifikovaná GP rovnice, zahrnující disipaci (dekoherenci):

$$\boxed{i\hbar\frac{\partial\Psi_{\nu\nu}}{\partial t} = \left[-\frac{\hbar^{2}}{2m_{\rm eff}}\nabla^{2} + g|\Psi_{\nu\nu}|^{2} + V_{\rm ext}(\mathbf{x})\right]\Psi_{\nu\nu} - i\frac{\Gamma_{\rm dec}}{2}\Psi_{\nu\nu}}$$

Kde:
*   $m_{\rm eff} \approx 0.1 \, \text{eV}$ je efektivní hmotnost páru.
*   $g \equiv \lambda/4! \approx 10^{-2}$ je síla kvartické interakce.
*   $V_{\rm ext}(\mathbf{x})$ je externí potenciál, který páruje kondenzát s hmotou a EM poli.
*   $\Gamma_{\rm dec}$ je míra dekoherence, která potlačuje koherenci kondenzátu v externím prostředí.

### 2. Emergentní Gravitační Konstanta a Fázová Koherence

Efektivní gravitační konstanta $G_{\rm eff}$ v Newtonovské limitě je odvozena z dimenzionální analýzy a je **přímo modifikována fázovou koherencí** kondenzátu:

$$G_{\rm eff} = \frac{c_\rho}{M_{\rm Pl}^{2}} \cdot \underbrace{\frac{n_\nu \Lambda_{\rm QCT}^{2}}{V_{\rm proj} m_\nu R_{\rm proj}}}_{\text{geometrický faktor}} \cdot \underbrace{\exp\left(-\frac{\sigma^{2}_{\rm avg}}{2}\right)}_{\text{faktor fázové koherence}}$$

Kde:
*   $\Lambda_{\rm QCT} = 107 \, \text{TeV}$ je efektivní cut-off škála EFT teorie, odvozená z $\Lambda_{\rm QCT} = \frac{3}{2}\sqrt{E_{\rm pair} \cdot m_p}$.
*   $\exp(-\sigma^{2}_{\rm avg}/2)$ je faktor, který snižuje gravitaci v důsledku **fázového šumu** v kondenzátu.

### 3. Vztah mezi Konformním Faktorem a Fázovým Šumem

QCT gravitační **screening je ekvivalentní konformnímu přeškálování** akustické metriky, což řeší paradox předurčenosti v modelech analogové gravitace:

$$\boxed{\Omega_{\text{QCT}}(r) = \sqrt{f_{\rm screen} \cdot K(r)} \quad \Leftrightarrow \quad \rho_{\text{eff}}(r) \propto \exp\left(-\frac{\sigma^{2}_{\rm avg}(r)}{2}\right)}$$

Kde $\Omega_{\text{QCT}}(r)$ je konformní faktor a $\sigma^{2}_{\rm avg}(r)$ je **fázová variance** (kvantový stupeň volnosti), přičemž jsou matematicky spojeny:

$$\boxed{\sigma^{2}_{\rm avg}(r) = -4\ln\Omega(r)}$$

## II. Dynamika Gravitačního a Elektromagnetického Pole

QCT odvozuje tvar gravitačních (Einsteinových) a elektromagnetických (Maxwellových) rovnic od geometrie a fázové koherence kondenzátu.

### 4. Vznik Maxwellových Rovnic

Elektromagnetické pole $A_\mu$ je emergentní **Goldstoneův režim** z narušení globální $U(1)$ symetrie kondenzátu:

$$A_\mu = \frac{\hbar}{e_{\rm eff}}\partial_\mu\theta, \quad F_{\mu\nu}=\partial_\mu A_\nu-\partial_\nu A_\mu$$

A splňuje **inhomogenní Maxwellovy rovnice** s topologickými zdroji:

$$\boxed{\partial_\nu F^{\nu\mu}=\mu_0 J^\mu}$$

Kde elektrický náboj $q$ je odvozen z **topologického vinutého čísla (vortex charge)** fáze kondenzátu:

$$q = \frac{1}{2\pi}\oint\nabla\theta\cdot d\mathbf l = n e, \quad n\in\mathbb Z$$

### 5. Efektivní Metrika Gravitace (Emergentní Einsteinovy rovnice)

Efektivní metrika $g_{\mu\nu}$ je dána hrubozrnně (coarse-graining) z mikroskopických fluktuací kondenzátu:

$$g_{\mu\nu}(\mathbf{r}) = \eta_{\mu\nu} + h_{\mu\nu}(\mathbf{x}), \quad h_{\mu\nu}(\mathbf{x}) = \frac{\kappa}{M_{\rm Pl}^{2}} \int d^{3}x' \, K_{\mu\nu}(\mathbf{x},\mathbf{x}') \cdot \frac{\delta\rho_{\rm ent}(\mathbf{x}')}{|\mathbf{x} - \mathbf{x}'|}$$

Kde:
*   $K_{\mu\nu}(\mathbf{x},\mathbf{x}')$ je **korelační jádro** odrážející kvantové korelace.
*   Vzhledem k **nelokalitě** tohoto jádra na škále $\xi \sim 1 \, \text{mm}$, je teorie mimo dosah Weinberg-Wittenova teorému.

## III. Dynamika Objektů na Astrofyzikálních a Kosmologických Škálách

Pro makroskopické objekty (galaxie, planety, černé díry) se aplikuje $G_{\rm eff}$ s ohledem na saturaci fázové dekoherence.

### 6. Dynamika Galaxií (Rotační křivky bez Temné Hmoty)

Celková rychlost rotace galaxie $V_{\rm QCT}$ je dána **kvadratickým součtem** baryónové (Newtonovské) a **vakuové odezvy** kondenzátu (nahrazující Temnou Hmotu):

$$\boxed{V_{\rm QCT}(r) = \sqrt{V_{\rm bar}^2(r) + V_{\rm vac}^2(r)}}$$

Kde vakuová odezva je:

$$\boxed{V_{\rm vac}^2(r) = \sqrt{G_N M_{\rm bar}(<r)a_0}}$$

Tato rovnice je matematicky ekvivalentní modelu MOND (Modified Newtonian Dynamics), ale je **odvozena** zde z mikroskopické teorie, kde $a_0 \approx 1.2 \times 10^{-10} \, \text{m/s}^2$ je kritické akcelerační měřítko koherence kondenzátu.

### 7. Screening na Krátkých Vzdálenostech (Sub-mm)

Na krátkých vzdálenostech ($r < R_{\rm proj} \approx 2.3 \, \text{cm}$) dominuje **Yukawův screening** s lokálně proměnnou délkou:

$$\boxed{G_{\rm eff}(r) = G_N \exp\left(-\frac{r}{\lambda_{\rm screen}(\mathbf{r})}\right)}$$

Kde **screeningová délka** $\lambda_{\rm screen}(\mathbf{r})$ je závislá na lokálním gravitačním potenciálu $\Phi$ (prostřednictvím $K(\mathbf{r})$):

$$\lambda_{\rm screen}(\mathbf{r}) = \frac{\lambda_{\rm screen}^{(0)}}{\sqrt{K(\mathbf{r})}}, \quad K(\mathbf{r}) \equiv 1 + \alpha \Phi(\mathbf{r})/c^{2}$$

### 8. Makroskopická Dynamika (Astrophysical Scales $r \gg R_{\rm proj}$)

Na astrofyzikálních škálách (kde screening už nepůsobí) je $G_{\rm eff}$ **univerzálně potlačena** kvůli saturaci fázové dekoherence ($\sigma_{\max}^2 \approx 0.2$):

$$\boxed{G_{\rm eff}(r \to \infty) \to G_N \times \exp\left(-\frac{\sigma_{\max}^2}{2}\right) \approx 0.9 \, G_N}$$

Tato redukce je **zamýšlenou predikcí QCT** a vysvětluje:
*   **Stíny Černých Děr (EHT):** Např. poloměr stínu $r_{\rm shadow}^{\rm QCT} \approx 0.95 \times r_{\rm shadow}^{\rm GR}$.
*   **Růst Struktur ($\sigma_8$):** Zmírňuje tenzi $\sigma_8$ predikcí $\sigma_8^{\rm QCT} \approx 0.77$, což je v lepší shodě s pozorováními slabé čočky.

### 9. Kosmologická Expanze (Temná Energie)

Hustota Temné Energie ($\rho_{\Lambda}$) je řízena zbytkovou energií párování z raného vesmíru, potlačenou **trojitým mechanismem**:

$$\boxed{\rho_\Lambda^{\rm QCT} = \rho_{\rm pairs}(z=0) \times f_c \times f_{\rm avg} \times f_{\rm freeze}}$$

Kde:
*   $\rho_{\rm pairs}(z=0) \approx 1.39 \times 10^{-29} \, \text{GeV}^4$ je hustota energie párování dnes.
*   $f_c = m_\nu/m_p \sim 10^{-10}$ je faktor koherence (screening).
*   $f_{\rm freeze} \sim 10^{-8}$ je faktor topologického zmrznutí (konzistentní s QCD).
*   Celkově to dává **$\rho_\Lambda^{\rm QCT} \approx 1.0 \times 10^{-47} \, \text{GeV}^4$** (přesná shoda s Planck 2018), což **řeší problém kosmologické konstanty**.