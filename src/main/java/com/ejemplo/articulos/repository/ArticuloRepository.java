package com.ejemplo.articulos.repository;

import com.ejemplo.articulos.model.Articulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticuloRepository extends JpaRepository<Articulo, Long> {
    List<Articulo> findByNombre(String nombre);
    List<Articulo> findByNombreContaining(String texto);
    List<Articulo> findByPrecioGreaterThan(Double precio);
    List<Articulo> findByPrecioBetween(Double min, Double max);
    List<Articulo> findByNombreIgnoreCase(String nombre);
    List<Articulo> findAllByOrderByPrecioAsc();
    List<Articulo> findByNombreAndPrecioGreaterThan(String nombre, Double precio);
}