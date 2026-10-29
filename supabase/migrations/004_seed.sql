-- =========================================================
-- Categorias padrão com formulários dinâmicos
-- =========================================================
insert into public.categories (name, form_schema) values
('Computador', jsonb_build_object(
  'fields', jsonb_build_array(
    jsonb_build_object('name','cpu','label','Processador','type','text','required',true),
    jsonb_build_object('name','ram_gb','label','RAM (GB)','type','number','required',true),
    jsonb_build_object('name','storage','label','Armazenamento','type','text','required',true),
    jsonb_build_object('name','so','label','Sistema Operacional','type','text','required',false)
  )
)),
('Monitor', jsonb_build_object(
  'fields', jsonb_build_array(
    jsonb_build_object('name','screen_size','label','Tamanho da tela (pol)','type','number','required',true),
    jsonb_build_object('name','resolution','label','Resolução','type','text','required',false),
    jsonb_build_object('name','connectors','label','Conectores','type','multiselect',
      'options', jsonb_build_array('HDMI','DisplayPort','VGA','DVI','USB-C'))
  )
)),
('Impressora', jsonb_build_object(
  'fields', jsonb_build_array(
    jsonb_build_object('name','printer_type','label','Tipo','type','select',
      'options', jsonb_build_array('Laser','Jato de tinta','Matricial','Tanque')),
    jsonb_build_object('name','color','label','Colorida','type','select',
      'options', jsonb_build_array('Sim','Não'))
  )
)),
('Switch', jsonb_build_object(
  'fields', jsonb_build_array(
    jsonb_build_object('name','ports','label','Nº de portas','type','number','required',true),
    jsonb_build_object('name','speed','label','Velocidade','type','select',
      'options', jsonb_build_array('10/100','Gigabit','10G')),
    jsonb_build_object('name','managed','label','Gerenciável','type','select',
      'options', jsonb_build_array('Sim','Não'))
  )
)),
('Projetor', jsonb_build_object(
  'fields', jsonb_build_array(
    jsonb_build_object('name','lumens','label','Lumens','type','number'),
    jsonb_build_object('name','resolution','label','Resolução','type','text')
  )
));

-- Unidade sede
insert into public.units (name, type) values ('Sede Administrativa', 'headquarters');
