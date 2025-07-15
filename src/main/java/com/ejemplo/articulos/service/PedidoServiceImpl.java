package com.ejemplo.articulos.service;

import com.ejemplo.articulos.model.Articulo;
import com.ejemplo.articulos.model.DetallePedido;
import com.ejemplo.articulos.model.Pedido;
import com.ejemplo.articulos.repository.ArticuloRepository;
import com.ejemplo.articulos.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ArticuloRepository articuloRepository;

    public PedidoServiceImpl(PedidoRepository pedidoRepository, ArticuloRepository articuloRepository) {
        this.pedidoRepository = pedidoRepository;
        this.articuloRepository = articuloRepository;
    }

    @Override
    public Pedido guardarPedido(Pedido pedido) {
        if (pedido.getFecha() == null) {
            pedido.setFecha(LocalDate.now());
        }

        for (DetallePedido detalle : pedido.getDetalles()) {
            Long articuloId = detalle.getArticulo().getId();
            Articulo articulo = articuloRepository.findById(articuloId)
                    .orElseThrow(() -> new RuntimeException("Artículo no encontrado con ID: " + articuloId));

             if (articulo.getCantidad() < detalle.getCantidad()) {
            throw new RuntimeException("No hay stock suficiente para el artículo: " + articulo.getNombre());
        }

        
        articulo.setCantidad(articulo.getCantidad() - detalle.getCantidad());
        articuloRepository.save(articulo);

            detalle.setArticulo(articulo);
            detalle.setPedido(pedido);
        }

        return pedidoRepository.save(pedido);
    }

    @Override
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    @Override
    public Optional<Pedido> obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id);
    }
}

