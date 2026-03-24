function enableDragScrollWithMomentum(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`No se encontró el contenedor: ${containerId}`);
    return;
  }

  let isDragging = false;
  let startY = 0;
  let scrollStart = 0;
  let prevY = 0;
  let velocity = 0;
  let rafId = null;

  const friction = 0.92;
  const minVelocityToContinue = 0.3;

  function animateMomentum() {
    if (Math.abs(velocity) < minVelocityToContinue) {
      velocity = 0;
      rafId = null;
      return;
    }

    container.scrollTop -= velocity;
    velocity *= friction;

    rafId = requestAnimationFrame(animateMomentum);
  }

  function stopMomentum() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // --- Mouse ---
  const onMouseDown = (e) => {
    isDragging = true;
    startY = e.pageY;
    prevY = e.pageY;
    scrollStart = container.scrollTop;
    velocity = 0;
    stopMomentum();
    container.style.cursor = 'grabbing';
    e.preventDefault(); // evita selección de texto
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const y = e.pageY;
    const delta = y - startY;
    container.scrollTop = scrollStart - delta * 1.8; // 1.8 = sensibilidad

    // Calculamos velocidad (más preciso si usamos delta reciente)
    velocity = (y - prevY) * 1.8;
    prevY = y;
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;
    container.style.cursor = 'grab';

    // Solo activamos momentum si hay velocidad significativa
    if (Math.abs(velocity) > minVelocityToContinue) {
      rafId = requestAnimationFrame(animateMomentum);
    }
  };

  // Eventos
  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mouseleave', onMouseUp);

  // --- Touch (muy importante para móviles) ---
  const onTouchStart = (e) => {
    isDragging = true;
    startY = e.touches[0].pageY;
    prevY = e.touches[0].pageY;
    scrollStart = container.scrollTop;
    velocity = 0;
    stopMomentum();
    // e.preventDefault();  ← no siempre, puede romper scroll nativo si no hay movimiento
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    // e.preventDefault();  ← activalo solo si querés forzar drag y desactivar scroll nativo

    const y = e.touches[0].pageY;
    const delta = y - startY;
    container.scrollTop = scrollStart - delta * 1.8;

    velocity = (y - prevY) * 1.8;
    prevY = y;
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    if (Math.abs(velocity) > minVelocityToContinue) {
      rafId = requestAnimationFrame(animateMomentum);
    }
  };

  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd);
  container.addEventListener('touchcancel', onTouchEnd);
}

// Uso:
enableDragScrollWithMomentum('container-of-events');
enableDragScrollWithMomentum('container-of-skins');
enableDragScrollWithMomentum('gallery-skins');

// Si después agregás más: enableDragScrollWithMomentum('otro-container');