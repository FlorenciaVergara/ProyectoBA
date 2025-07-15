package com.ejemplo.articulos.controller;

import com.ejemplo.articulos.dto.DetallePedidoDTO;
import com.ejemplo.articulos.dto.PedidoDTO;
import com.ejemplo.articulos.model.Pedido;
import com.ejemplo.articulos.service.PedidoService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<Void> crearPedido(@RequestBody Pedido pedido) {
        pedidoService.guardarPedido(pedido);
        return ResponseEntity.ok().build();
    }

    @GetMapping
public ResponseEntity<List<PedidoDTO>> listarPedidos() {
    List<PedidoDTO> pedidosDTO = pedidoService.listarPedidos().stream()
        .map(pedido -> {
            List<DetallePedidoDTO> detallesDTO = pedido.getDetalles().stream()
                .map(d -> new DetallePedidoDTO(
                    d.getArticulo().getNombre(),
                    d.getCantidad(),
                    d.getArticulo().getPrecio()))
                .toList();
            return new PedidoDTO(pedido.getId(), pedido.getFecha(), detallesDTO);
        }).toList();

    return ResponseEntity.ok(pedidosDTO);
}


    @GetMapping("/{id}")
public ResponseEntity<PedidoDTO> obtenerPedidoPorId(@PathVariable Long id) {
    return pedidoService.obtenerPedidoPorId(id)
        .map(pedido -> {
            List<DetallePedidoDTO> detallesDTO = pedido.getDetalles().stream()
                .map(d -> new DetallePedidoDTO(
                    d.getArticulo().getNombre(),
                    d.getCantidad(),
                    d.getArticulo().getPrecio()))
                .toList();
            PedidoDTO pedidoDTO = new PedidoDTO(pedido.getId(), pedido.getFecha(), detallesDTO);
            return ResponseEntity.ok(pedidoDTO);
        })
        .orElseGet(() -> ResponseEntity.notFound().build());
}

    
}

