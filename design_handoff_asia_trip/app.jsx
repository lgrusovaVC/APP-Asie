// Mounts the design canvas. All seven pages of the app, designed in the
// Atlas Editorial / 朱 Sumi & Shu palette the user picked.

const ABW = 1240;
const ABH = 940;

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="atlas-app"
        title="Korea &amp; Japonsko 2026 · kompletní app"
        subtitle="Všech sedm stránek v Atlas Editorial paletě 朱 Sumi & Shu. Layout konzistentní; každá obrazovka má vlastní hierarchii a typografický gesture odpovídající obsahu."
      >
        <DCArtboard id="p1-dash"     label="01 · Přehled"      width={ABW} height={ABH}><V2Dashboard palette="shu" /></DCArtboard>
        <DCArtboard id="p2-flights"  label="02 · Letenky"      width={ABW} height={ABH}><V2Flights   palette="shu" /></DCArtboard>
        <DCArtboard id="p3-hotels"   label="03 · Ubytování"    width={ABW} height={ABH}><V2Hotels    palette="shu" /></DCArtboard>
        <DCArtboard id="p4-trips"    label="04 · Místa"        width={ABW} height={ABH}><V2Trips     palette="shu" /></DCArtboard>
        <DCArtboard id="p5-food"     label="05 · Restaurace"   width={ABW} height={ABH}><V2Food      palette="shu" /></DCArtboard>
        <DCArtboard id="p6-schedule" label="06 · Jízdní řády"  width={ABW} height={ABH}><V2Schedule  palette="shu" /></DCArtboard>
        <DCArtboard id="p7-budget"   label="07 · Rozpočet"     width={ABW} height={ABH}><V2Budget    palette="shu" /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
