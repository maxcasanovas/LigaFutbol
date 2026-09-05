using LigaFutbol.Api.Data;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class Repository<TEntity>(LigaFutbolDbContext context) : IRepository<TEntity> where TEntity : class
{
    protected readonly LigaFutbolDbContext Context = context;
    protected readonly DbSet<TEntity> DbSet = context.Set<TEntity>();

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync() => await DbSet.ToListAsync();

    public virtual async Task<TEntity?> GetByIdAsync(int id) => await DbSet.FindAsync(id);

    public async Task<TEntity> AddAsync(TEntity entity)
    {
        await DbSet.AddAsync(entity);
        return entity;
    }

    public void Update(TEntity entity) => DbSet.Update(entity);

    public void Remove(TEntity entity) => DbSet.Remove(entity);

    public async Task<bool> SaveChangesAsync() => await Context.SaveChangesAsync() > 0;
}
