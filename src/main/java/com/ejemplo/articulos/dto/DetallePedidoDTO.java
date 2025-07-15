package com.ejemplo.articulos.dto;


public class DetallePedidoDTO {
    private String nombreArticulo;
    private int cantidad;
    private double precioUnitario;
    private double subtotal;

    public DetallePedidoDTO(String nombreArticulo, int cantidad, double precioUnitario) {
        this.nombreArticulo = nombreArticulo;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = cantidad * precioUnitario;
    }

    public String getNombreArticulo() {
        return nombreArticulo;
    }

    public int getCantidad() {
        return cantidad;
    }

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public double getSubtotal() {
        return subtotal;
    }
}

