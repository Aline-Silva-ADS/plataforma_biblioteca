// backend/expirarReservasJob.js
// Script para agendar expiração automática de reservas a cada 30 minutos

const cron = require('node-cron');
const pool = require('./config/db');

async function expirarReservas() {
  const conn = await pool.getConnection();
  try {
    // Seleciona reservas ativas vencidas
    const [expiradas] = await conn.query(`
      SELECT r.id_reserva, r.id_livro
      FROM reservas r
      WHERE r.status = 'ativa' AND r.prazo_validade < NOW()
    `);

    if (expiradas.length === 0) {
      return;
    }

    // Expira as reservas
    const ids = expiradas.map(r => r.id_reserva);
    await conn.query(
      `UPDATE reservas SET status = 'expirada' WHERE id_reserva IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // Libera as cópias dos livros (deixa disponíveis para empréstimo)
    for (const reserva of expiradas) {
      const [outras] = await conn.query(
        'SELECT COUNT(*) as total FROM reservas WHERE id_livro = ? AND status = "ativa"',
        [reserva.id_livro]
      );
      if (outras[0].total === 0) {
        await conn.query(
          'UPDATE copias SET status = "disponivel" WHERE id_livro = ? AND status = "reservado"',
          [reserva.id_livro]
        );
      }
    }
    console.log(`[expirarReservas] ${ids.length} reservas expiradas e livros liberados.`);
  } catch (err) {
    console.error('[expirarReservas] Erro:', err.message);
  } finally {
    conn.release();
  }
}

// Agenda para rodar a cada 30 minutos
cron.schedule('*/30 * * * *', expirarReservas);

console.log('Agendador de expiração de reservas iniciado.');
