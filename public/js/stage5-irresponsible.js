/* ---------- Irresponsible: curated "no design system" variants ---------- */
const IR_VARIANTS = [
  {
    caption: '<strong>Font:</strong> rounded / playful · <strong>Palette:</strong> pastel · <strong>Structure:</strong> none — one paragraph',
    html: `
      <div style="background: #f7ecf5; border-radius: 24px; padding: 22px 24px; display: flex; justify-content: center;">
        <p style="font-family: 'Comic Sans MS', 'Bricolage Grotesque', cursive, sans-serif; font-size: 14px; line-height: 1.7; color: #6b3f66; max-width: 46ch; margin: 0; text-align: center;">
          Okay so for your 34th birthday bash 🌵🎉 here's the plan: you'll want to lock down a venue soon since you only have 10 days, don't forget the cactus-themed cake (maybe ask a local bakery!), and keep an eye on that $2000 budget because decorations and snacks add up fast — also follow up with the 6 guests who haven't RSVP'd yet, that's kind of important. Good luck!! 🥳
        </p>
      </div>`
  },
  {
    caption: '<strong>Font:</strong> Arial · <strong>Palette:</strong> navy corporate blue · <strong>Structure:</strong> dense data table',
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background: #ffffff;">
        <div style="font-size: 15px; font-weight: bold; color: #1a3d6d; margin-bottom: 10px;">Task Tracker: 34th Birthday</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #333;">
          <tr style="background: #1a3d6d; color: #fff;">
            <td style="border: 1px solid #ccc; padding: 4px 6px;">Item</td>
            <td style="border: 1px solid #ccc; padding: 4px 6px;">Status</td>
            <td style="border: 1px solid #ccc; padding: 4px 6px;">Notes</td>
          </tr>
          <tr><td style="border: 1px solid #ccc; padding: 4px 6px;">Venue</td><td style="border: 1px solid #ccc; padding: 4px 6px; color:#a34322;">Not booked</td><td style="border: 1px solid #ccc; padding: 4px 6px;">Need reception hall, 10 days out</td></tr>
          <tr style="background:#f2f2f2;"><td style="border: 1px solid #ccc; padding: 4px 6px;">Cake</td><td style="border: 1px solid #ccc; padding: 4px 6px; color:#a34322;">Not ordered</td><td style="border: 1px solid #ccc; padding: 4px 6px;">Cactus themed</td></tr>
          <tr><td style="border: 1px solid #ccc; padding: 4px 6px;">Guest list</td><td style="border: 1px solid #ccc; padding: 4px 6px;">12/18 confirmed</td><td style="border: 1px solid #ccc; padding: 4px 6px;">6 pending</td></tr>
          <tr style="background:#f2f2f2;"><td style="border: 1px solid #ccc; padding: 4px 6px;">Budget</td><td style="border: 1px solid #ccc; padding: 4px 6px;">$0 / $2000</td><td style="border: 1px solid #ccc; padding: 4px 6px;">Nothing spent yet</td></tr>
        </table>
      </div>`
  },
  {
    caption: '<strong>Font:</strong> bold marketing sans · <strong>Palette:</strong> purple–blue gradient · <strong>Structure:</strong> oversized card grid',
    html: `
      <div style="background: linear-gradient(135deg, #7c3aed, #2563eb); border-radius: 16px; padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px;">
          <div style="background: #fff; border-radius: 999px; padding: 16px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.25); font-family: 'Poppins', 'Inter', sans-serif;">
            <div style="font-size: 22px;">🎪</div>
            <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-top: 4px;">VENUE</div>
          </div>
          <div style="background: #fff; border-radius: 999px; padding: 16px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.25); font-family: 'Poppins', 'Inter', sans-serif;">
            <div style="font-size: 22px;">🎂</div>
            <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-top: 4px;">CAKE</div>
          </div>
          <div style="background: #fff; border-radius: 999px; padding: 16px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.25); font-family: 'Poppins', 'Inter', sans-serif;">
            <div style="font-size: 22px;">👥</div>
            <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-top: 4px;">GUESTS</div>
          </div>
          <div style="background: #fff; border-radius: 999px; padding: 16px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.25); font-family: 'Poppins', 'Inter', sans-serif;">
            <div style="font-size: 22px;">💰</div>
            <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-top: 4px;">BUDGET</div>
          </div>
        </div>
      </div>`
  },
  {
    caption: '<strong>Font:</strong> tiny, low-contrast · <strong>Palette:</strong> flat gray · <strong>Structure:</strong> controls that don’t actually work',
    html: `
      <div style="background: #e5e5e5; padding: 16px; border-radius: 4px;">
        <div style="font-family: Arial, sans-serif; font-size: 10px; color: #999999; line-height: 1.6;">
          <div style="margin-bottom: 8px;">party planning / 34th bday / draft</div>
          <div style="background: #dcdcdc; border: 1px solid #c9c9c9; border-radius: 2px; padding: 5px 8px; width: 160px; margin-bottom: 6px; color:#a3a3a3;">▼ Select venue...</div>
          <div style="background: #dcdcdc; border: 1px solid #c9c9c9; border-radius: 2px; padding: 5px 8px; width: 160px; margin-bottom: 6px; color:#a3a3a3;">▼ Select cake vendor...</div>
          <div>budget: $2000.00 &nbsp; spent: $0.00 &nbsp; remaining: $2000.00</div>
          <div style="margin-top: 6px;">guests confirmed: 12 / 18</div>
        </div>
      </div>`
  }
];
let irIndex = 0;
function irRenderVariant(i) {
  const v = IR_VARIANTS[i];
  document.getElementById('irRender').innerHTML = v.html;
  document.getElementById('irCaption').innerHTML = v.caption;
  document.getElementById('irVariantLabel').textContent = `Attempt ${i + 1} of ${IR_VARIANTS.length}`;
}
irRenderVariant(0);
document.getElementById('irRegenBtn').addEventListener('click', () => {
  const frame = document.getElementById('irFrame');
  frame.classList.add('swapping');
  setTimeout(() => {
    irIndex = (irIndex + 1) % IR_VARIANTS.length;
    irRenderVariant(irIndex);
    frame.classList.remove('swapping');
  }, 200);
});

