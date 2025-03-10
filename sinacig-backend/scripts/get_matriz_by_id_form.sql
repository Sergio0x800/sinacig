USE [control_sinacig]
GO
       /****** Object:  StoredProcedure [dbo].[get_matriz_by_id_form]    Script Date: 30/06/2022 10:30:06 ******/
SET
       ANSI_NULLS ON
GO
SET
       QUOTED_IDENTIFIER ON
GO
       ALTER procedure [dbo].[get_matriz_by_id_form] @id_matriz int as Begin
select
       ttm.id_matriz as 'id_matriz',
       tcu.codigo_unidad as 'codigo_unidad',
       tcu.nombre_unidad as 'nombre_unidad',
       CONVERT(varchar, ttm.fecha_periodo_inicio) as 'fecha_periodo_inicio',
       CONVERT(varchar, ttm.fecha_periodo_fin) as 'fecha_periodo_fin',
       ttm.periodo_abierto as 'periodo_abierto'
from
       tt_matriz ttm
       INNER JOIN tc_unidad_ejecutora tcu ON tcu.id_unidad_ejecutora = ttm.id_unidad_ejecutora
where
       ttm.id_matriz = @id_matriz
       and ttm.estado_registro = 1
       and tcu.estado_registro = 1;