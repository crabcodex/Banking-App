## Ticket

AUTH-01

## Descripción

Implementa registro de cliente usando CQRS + Event Sourcing.

## Flujo

1. Endpoint POST /api/auth/register
2. CommandBus ejecuta RegisterCustomerCommand
3. Handler valida email único
4. Aggregate genera evento
5. EventStore persiste
6. EventBus publica
7. Projection actualiza read model

## Cambios realizados

- RegisterCustomerCommand
- RegisterCustomerHandler
- Endpoint /auth/register
- CustomerProjection
- Schema Drizzle + migraciones

## Tests

### Integración

- Registro exitoso
- Email duplicado

### Unitarios

- Validación email existente
- Ejecución del handler

## Checklist

- [ ] Tests pasan
- [ ] Linter pasa
- [ ] No rompe API existente
- [ ] Arquitectura CQRS respetada
- [ ] Sin lógica en controller
