// -- Dominio --
export { AggregateRoot } from './domain/AggregateRoot';
export type { AggregateSnapshot } from './domain/AggregateRoot';
export { DomainEvent } from './domain/DomainEvent';
export { ValueObject } from './domain/ValueObject';
export { Entity } from './domain/Entity';
export type { EventMetadata, StreamVersion, EventStream } from './domain/types';

// -- Errores --
export { DomainError } from './errors/DomainError';
export { ConcurrencyError } from './errors/ConcurrencyError';
export { NotFoundError } from './errors/NotFoundError';
export { UnauthorizedError } from './errors/UnauthorizedError';
export { ForbiddenError } from './errors/ForbiddenError';
export { ValidationError } from './errors/ValidationError';

// -- Aplicacion (CQRS) --
export type { ICommand, CommandMetadata } from './application/ICommand';
export type { ICommandBus } from './application/ICommandBus';
export type { ICommandMiddleware, NextMiddleware } from './application/ICommandMiddleware';
export type { ICommandHandler } from './application/ICommandHandler';
export type { IQueryHandler } from './application/IQueryHandler';
export type { IEventHandler } from './application/IEventHandler';
export type { ITokenVerifier, TokenPayload } from './application/ITokenVerifier';

// -- Infraestructura (contratos) --
export type { IEventStore } from './infrastructure/event-store/IEventStore';
export type { StoredEvent } from './infrastructure/event-store/StoredEvent';
export type { EventDeserializer } from './infrastructure/event-store/EventDeserializer';
export type { ISnapshotStore } from './infrastructure/snapshot/ISnapshotStore';
export type { IEventBus } from './infrastructure/event-bus/IEventBus';
export type { IProjection } from './infrastructure/projection/IProjection';
