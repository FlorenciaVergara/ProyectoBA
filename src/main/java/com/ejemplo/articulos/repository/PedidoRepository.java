package com.ejemplo.articulos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ejemplo.articulos.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {}

