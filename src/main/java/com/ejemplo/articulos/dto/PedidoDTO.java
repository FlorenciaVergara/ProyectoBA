package com.ejemplo.articulos.dto;

import java.time.LocalDate;
import java.util.List;

public class PedidoDTO {
    private Long id;
    private LocalDate fecha;
    private List<DetallePedidoDTO> detalles;
    private double total;

    public PedidoDTO(Long id, LocalDate fecha, List<DetallePedidoDTO> detalles) {
        this.id = id;
        this.fecha = fecha;
        this.detalles = detalles;
        this.total = detalles.stream().mapToDouble(DetallePedidoDTO::getSubtotal).sum();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public List<DetallePedidoDTO> getDetalles() {
        return detalles;
    }

    public double getTotal() {
        return total;
    }
}

