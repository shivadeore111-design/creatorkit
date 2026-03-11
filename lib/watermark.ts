export const applyWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isPremium = false
) => {
  if (isPremium) return;

  ctx.save();
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText('Made with CreatorKit', width - 28, height - 28);
  ctx.restore();
};
